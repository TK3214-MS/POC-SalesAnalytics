using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using FunctionsApp.Data;
using FunctionsApp.Shared;
using System.Net;

namespace FunctionsApp.Http;

public class ApproveOutcomeLabelRequest
{
    private readonly ICosmosRepository _cosmosRepo;

    public ApproveOutcomeLabelRequest(ICosmosRepository cosmosRepo)
    {
        _cosmosRepo = cosmosRepo;
    }

    [Function(nameof(ApproveOutcomeLabelRequest))]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "ApproveOutcomeLabelRequest")] HttpRequestData req,
        FunctionContext context)
    {
        var logger = context.GetLogger(nameof(ApproveOutcomeLabelRequest));
        var traceId = Trace.GenerateTraceId();

        try
        {
            var claims = AuthZ.GetUserClaims(req);

            if (claims.Role != "Manager")
            {
                throw new UnauthorizedAccessException("Only managers can approve requests");
            }

            var command = await req.ReadFromJsonAsync<ApproveOutcomeLabelRequestCommand>()
                ?? throw new InvalidOperationException("Invalid request body");

            var validator = new ApproveOutcomeLabelRequestValidator();
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequest.WriteAsJsonAsync(new { errors = validationResult.Errors, traceId });
                return badRequest;
            }

            // TODO: requestId から sessionId を逆引きする必要がある
            // 簡易実装: 全承認待ちセッションから検索
            var sessions = await _cosmosRepo.ListPendingApprovalSessionsAsync(claims.StoreId);
            var session = sessions.FirstOrDefault(s => s.OutcomeLabelRequest?.Id == command.RequestId)
                ?? throw new InvalidOperationException("Request not found");

            // 店舗スコープチェック
            AuthZ.EnforceManagerStoreScope(claims, session);

            if (session.OutcomeLabelRequest == null || session.OutcomeLabelRequest.Status != "pending")
            {
                throw new InvalidOperationException("Invalid request status");
            }

            // 承認
            session.OutcomeLabel = session.OutcomeLabelRequest.Outcome;
            session.OutcomeLabelRequest.Status = "approved";
            await _cosmosRepo.UpdateSessionAsync(session);

            // 監査ログ
            var deadlineExceeded = AuthZ.IsDeadlineExceeded(session);
            await _cosmosRepo.AppendAuditLogAsync(new LabelAudit
            {
                Id = $"audit-{Guid.NewGuid()}",
                SessionId = session.Id,
                Timestamp = DateTime.UtcNow,
                Action = deadlineExceeded ? "OVERRIDE" : "APPROVED",
                ActorUserId = claims.UserId,
                ActorRole = claims.Role,
                Outcome = session.OutcomeLabel,
                Reason = command.Reason,
                Metadata = new Dictionary<string, object>
                {
                    ["requestId"] = command.RequestId,
                    ["deadlineExceeded"] = deadlineExceeded
                }
            });

            logger.LogInformation($"Outcome label request approved: {command.RequestId}");

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new { message = "Request approved", traceId });
            return response;
        }
        catch (Exception ex)
        {
            logger.LogError($"ApproveOutcomeLabelRequest failed: {ex.Message}");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = ex.Message, traceId });
            return errorResponse;
        }
    }
}
