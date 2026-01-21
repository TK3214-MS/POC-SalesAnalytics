using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using FunctionsApp.Data;
using FunctionsApp.Shared;
using System.Net;

namespace FunctionsApp.Http;

public class GetAuditLog
{
    private readonly ICosmosRepository _cosmosRepo;

    public GetAuditLog(ICosmosRepository cosmosRepo)
    {
        _cosmosRepo = cosmosRepo;
    }

    [Function(nameof(GetAuditLog))]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "get", Route = "GetAuditLog")] HttpRequestData req,
        FunctionContext context)
    {
        var logger = context.GetLogger(nameof(GetAuditLog));
        var traceId = Trace.GenerateTraceId();

        try
        {
            var claims = AuthZ.GetUserClaims(req);
            var sessionId = req.Query["sessionId"];

            if (string.IsNullOrEmpty(sessionId))
            {
                var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequest.WriteAsJsonAsync(new { error = "sessionId is required", traceId });
                return badRequest;
            }

            // 監査ログは追記専用で、Auditor/Manager のみ閲覧可能
            if (claims.Role != "Auditor" && claims.Role != "Manager")
            {
                throw new UnauthorizedAccessException("Only Auditor and Manager can access audit logs");
            }

            var auditLogs = await _cosmosRepo.GetAuditLogsAsync(sessionId);

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new { logs = auditLogs, traceId });
            return response;
        }
        catch (Exception ex)
        {
            logger.LogError($"GetAuditLog failed: {ex.Message}");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = ex.Message, traceId });
            return errorResponse;
        }
    }
}
