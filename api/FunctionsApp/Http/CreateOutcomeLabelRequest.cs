using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using FunctionsApp.Data;
using FunctionsApp.Shared;
using System.Net;

namespace FunctionsApp.Http;

public class CreateOutcomeLabelRequest
{
    private readonly CosmosRepository _cosmosRepo;

    public CreateOutcomeLabelRequest(CosmosRepository cosmosRepo)
    {
        _cosmosRepo = cosmosRepo;
    }

    [Function(nameof(CreateOutcomeLabelRequest))]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "CreateOutcomeLabelRequest")] HttpRequestData req,
        FunctionContext context)
    {
        var logger = context.GetLogger(nameof(CreateOutcomeLabelRequest));
        var traceId = Trace.GenerateTraceId();

        try
        {
            var claims = AuthZ.GetUserClaims(req);
            AuthZ.EnforceAuditorReadOnly(claims);

            var command = await req.ReadFromJsonAsync<CreateOutcomeLabelRequestCommand>()
                ?? throw new InvalidOperationException("Invalid request body");

            var validator = new CreateOutcomeLabelRequestValidator();
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequest.WriteAsJsonAsync(new { errors = validationResult.Errors, traceId });
                return badRequest;
            }

            var session = await _cosmosRepo.GetSessionAsync(command.SessionId, claims.UserId);

            // RBAC: Sales は自分のセッションのみ
            AuthZ.EnforceSalesScope(claims, session);

            if (session.OutcomeLabel != null)
            {
                throw new InvalidOperationException("Outcome label already set");
            }

            if (session.OutcomeLabelRequest != null && session.OutcomeLabelRequest.Status == "pending")
            {
                throw new InvalidOperationException("Outcome label request already pending");
            }

            // 期限チェック（超過時は理由必須）
            var deadlineExceeded = AuthZ.IsDeadlineExceeded(session);
            if (deadlineExceeded && string.IsNullOrEmpty(command.Reason))
            {
                throw new InvalidOperationException("Reason is required for deadline-exceeded requests");
            }

            // リクエスト作成
            var requestId = $"req-{Guid.NewGuid()}";
            session.OutcomeLabelRequest = new OutcomeLabelRequest
            {
                Id = requestId,
                RequestedBy = claims.UserId,
                RequestedAt = DateTime.UtcNow,
                Outcome = command.Outcome,
                Reason = command.Reason,
                Status = "pending"
            };

            await _cosmosRepo.UpdateSessionAsync(session);

            // 監査ログ
            await _cosmosRepo.AppendAuditLogAsync(new LabelAudit
            {
                Id = $"audit-{Guid.NewGuid()}",
                SessionId = session.Id,
                Timestamp = DateTime.UtcNow,
                Action = "REQUEST_CREATED",
                ActorUserId = claims.UserId,
                ActorRole = claims.Role,
                Outcome = command.Outcome,
                Reason = command.Reason,
                Metadata = new Dictionary<string, object>
                {
                    ["deadlineExceeded"] = deadlineExceeded,
                    ["requestId"] = requestId
                }
            });

            logger.LogInformation($"Outcome label request created: {requestId}");

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new { requestId, message = "Request created", traceId });
            return response;
        }
        catch (Exception ex)
        {
            logger.LogError($"CreateOutcomeLabelRequest failed: {ex.Message}");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = ex.Message, traceId });
            return errorResponse;
        }
    }
}
