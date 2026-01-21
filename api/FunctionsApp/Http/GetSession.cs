using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using FunctionsApp.Data;
using FunctionsApp.Shared;
using System.Net;

namespace FunctionsApp.Http;

public class GetSession
{
    private readonly ICosmosRepository _cosmosRepo;

    public GetSession(ICosmosRepository cosmosRepo)
    {
        _cosmosRepo = cosmosRepo;
    }

    [Function(nameof(GetSession))]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "get", Route = "GetSession")] HttpRequestData req,
        FunctionContext context)
    {
        var logger = context.GetLogger(nameof(GetSession));
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

            // TODO: userId は session から取得する必要があるため、先にクエリ
            // 簡易実装では claims.UserId を使用
            var session = await _cosmosRepo.GetSessionAsync(sessionId, claims.UserId);

            // RBAC: Sales は自分のセッションのみ、Manager は自店舗のみ
            if (claims.Role == "Sales")
            {
                AuthZ.EnforceSalesScope(claims, session);
            }
            else if (claims.Role == "Manager")
            {
                AuthZ.EnforceManagerStoreScope(claims, session);
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(session);
            return response;
        }
        catch (Exception ex)
        {
            logger.LogError($"GetSession failed: {ex.Message}");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = ex.Message, traceId });
            return errorResponse;
        }
    }
}
