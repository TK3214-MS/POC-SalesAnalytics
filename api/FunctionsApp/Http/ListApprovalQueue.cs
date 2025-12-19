using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using FunctionsApp.Data;
using FunctionsApp.Shared;
using System.Net;

namespace FunctionsApp.Http;

public class ListApprovalQueue
{
    private readonly CosmosRepository _cosmosRepo;

    public ListApprovalQueue(CosmosRepository cosmosRepo)
    {
        _cosmosRepo = cosmosRepo;
    }

    [Function(nameof(ListApprovalQueue))]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "get", Route = "ListApprovalQueue")] HttpRequestData req,
        FunctionContext context)
    {
        var logger = context.GetLogger(nameof(ListApprovalQueue));
        var traceId = Trace.GenerateTraceId();

        try
        {
            var claims = AuthZ.GetUserClaims(req);

            if (claims.Role != "Manager")
            {
                throw new UnauthorizedAccessException("Only managers can access approval queue");
            }

            // 自店舗の承認待ちセッション
            var sessions = await _cosmosRepo.ListPendingApprovalSessionsAsync(claims.StoreId);

            var requests = sessions
                .Where(s => s.OutcomeLabelRequest != null)
                .Select(s => new
                {
                    Id = s.OutcomeLabelRequest!.Id,
                    SessionId = s.Id,
                    CustomerName = s.CustomerName,
                    RequestedBy = s.OutcomeLabelRequest.RequestedBy,
                    RequestedAt = s.OutcomeLabelRequest.RequestedAt,
                    Outcome = s.OutcomeLabelRequest.Outcome,
                    Reason = s.OutcomeLabelRequest.Reason,
                    DeadlineExceeded = AuthZ.IsDeadlineExceeded(s)
                });

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new { requests, traceId });
            return response;
        }
        catch (Exception ex)
        {
            logger.LogError($"ListApprovalQueue failed: {ex.Message}");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = ex.Message, traceId });
            return errorResponse;
        }
    }
}
