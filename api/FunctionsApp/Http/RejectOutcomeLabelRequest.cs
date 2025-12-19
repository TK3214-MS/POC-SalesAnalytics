using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using FunctionsApp.Data;
using FunctionsApp.Shared;
using System.Net;

namespace FunctionsApp.Http;

public class RejectOutcomeLabelRequest
{
    private readonly CosmosRepository _cosmosRepo;

    public RejectOutcomeLabelRequest(CosmosRepository cosmosRepo)
    {
        _cosmosRepo = cosmosRepo;
    }

    [Function(nameof(RejectOutcomeLabelRequest))]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "RejectOutcomeLabelRequest")] HttpRequestData req,
        FunctionContext context)
    {
        var logger = context.GetLogger(nameof(RejectOutcomeLabelRequest));
        var traceId = Trace.GenerateTraceId();

        try
        {
            var claims = AuthZ.GetUserClaims(req);

            if (claims.Role != "Manager")
            {
                throw new UnauthorizedAccessException("Only managers can reject requests");
            }

            var command = await req.ReadFromJsonAsync<RejectOutcomeLabelRequestCommand>()
                ?? throw new InvalidOperationException("Invalid request body");

            var validator = new RejectOutcomeLabelRequestValidator();
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequest.WriteAsJsonAsync(new { errors = validationResult.Errors, traceId });
                return badRequest;
            }

            var sessions = await _cosmosRepo.ListPendingApprovalSessionsAsync(claims.StoreId);
            var session = sessions.FirstOrDefault(s => s.OutcomeLabelRequest?.Id == command.RequestId)
                ?? throw new InvalidOperationException("Request not found");

            AuthZ.EnforceManagerStoreScope(claims, session);

            if (session.OutcomeLabelRequest == null || session.OutcomeLabelRequest.Status != "pending")
            {
                throw new InvalidOperationException("Invalid request status");
            }

            // 却下
            session.OutcomeLabelRequest.Status = "rejected";
            await _cosmosRepo.UpdateSessionAsync(session);

            // 監査ログ
            await _cosmosRepo.AppendAuditLogAsync(new LabelAudit
            {
                Id = $"audit-{Guid.NewGuid()}",
                SessionId = session.Id,
                Timestamp = DateTime.UtcNow,
                Action = "REJECTED",
                ActorUserId = claims.UserId,
                ActorRole = claims.Role,
                Outcome = session.OutcomeLabelRequest.Outcome,
                Reason = command.Reason,
                Metadata = new Dictionary<string, object>
                {
                    ["requestId"] = command.RequestId
                }
            });

            logger.LogInformation($"Outcome label request rejected: {command.RequestId}");

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new { message = "Request rejected", traceId });
            return response;
        }
        catch (Exception ex)
        {
            logger.LogError($"RejectOutcomeLabelRequest failed: {ex.Message}");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = ex.Message, traceId });
            return errorResponse;
        }
    }
}
