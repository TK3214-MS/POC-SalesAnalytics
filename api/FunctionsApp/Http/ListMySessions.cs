using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using FunctionsApp.Data;
using FunctionsApp.Shared;
using System.Net;

namespace FunctionsApp.Http;

public class ListMySessions
{
    private readonly ICosmosRepository _cosmosRepo;

    public ListMySessions(ICosmosRepository cosmosRepo)
    {
        _cosmosRepo = cosmosRepo;
    }

    [Function(nameof(ListMySessions))]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "get", Route = "ListMySessions")] HttpRequestData req,
        FunctionContext context)
    {
        var logger = context.GetLogger(nameof(ListMySessions));
        var traceId = Trace.GenerateTraceId();

        try
        {
            var claims = AuthZ.GetUserClaims(req);

            List<Session> sessions;

            if (claims.Role == "Sales")
            {
                // Sales: 自分のセッションのみ
                sessions = await _cosmosRepo.ListUserSessionsAsync(claims.UserId);
            }
            else if (claims.Role == "Manager" || claims.Role == "Auditor")
            {
                // Manager/Auditor: 自店舗のセッション
                sessions = await _cosmosRepo.ListStoreSessionsAsync(claims.StoreId);
            }
            else
            {
                throw new UnauthorizedAccessException("Invalid role");
            }

            // 残り日数を計算
            var sessionsWithDeadline = sessions.Select(s => new
            {
                s.Id,
                s.CustomerName,
                s.CreatedAt,
                s.Status,
                s.OutcomeLabel,
                DeadlineDays = AuthZ.GetRemainingDays(s)
            });

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new { sessions = sessionsWithDeadline, traceId });
            return response;
        }
        catch (Exception ex)
        {
            logger.LogError($"ListMySessions failed: {ex.Message}");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = ex.Message, traceId });
            return errorResponse;
        }
    }
}
