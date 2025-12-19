using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using FunctionsApp.Data;
using FunctionsApp.Shared;
using System.Net;

namespace FunctionsApp.Http;

public class GetKpi
{
    private readonly CosmosRepository _cosmosRepo;

    public GetKpi(CosmosRepository cosmosRepo)
    {
        _cosmosRepo = cosmosRepo;
    }

    [Function(nameof(GetKpi))]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "get", Route = "GetKpi")] HttpRequestData req,
        FunctionContext context)
    {
        var logger = context.GetLogger(nameof(GetKpi));
        var traceId = Trace.GenerateTraceId();

        try
        {
            var claims = AuthZ.GetUserClaims(req);

            // Manager/Auditor は自店舗、Sales は自分のみ
            List<Session> sessions;
            if (claims.Role == "Sales")
            {
                sessions = await _cosmosRepo.ListUserSessionsAsync(claims.UserId, limit: 1000);
            }
            else
            {
                sessions = await _cosmosRepo.ListStoreSessionsAsync(claims.StoreId, limit: 1000);
            }

            // 店舗別集計
            var storeKpis = sessions
                .Where(s => s.OutcomeLabel != null)
                .GroupBy(s => s.StoreId)
                .Select(g => new
                {
                    StoreId = g.Key,
                    Total = g.Count(),
                    Won = g.Count(s => s.OutcomeLabel == "won"),
                    Lost = g.Count(s => s.OutcomeLabel == "lost"),
                    Pending = g.Count(s => s.OutcomeLabel == "pending"),
                    Canceled = g.Count(s => s.OutcomeLabel == "canceled"),
                    ConversionRate = g.Count(s => s.OutcomeLabel == "won" || s.OutcomeLabel == "lost") > 0
                        ? (double)g.Count(s => s.OutcomeLabel == "won") / g.Count(s => s.OutcomeLabel == "won" || s.OutcomeLabel == "lost") * 100
                        : 0.0
                })
                .ToList();

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new { stores = storeKpis, traceId });
            return response;
        }
        catch (Exception ex)
        {
            logger.LogError($"GetKpi failed: {ex.Message}");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = ex.Message, traceId });
            return errorResponse;
        }
    }
}
