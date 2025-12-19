using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using FunctionsApp.Data;

namespace FunctionsApp.Activities;

public class IndexToSearchActivity
{
    private readonly SearchRepository _searchRepo;

    public IndexToSearchActivity(SearchRepository searchRepo)
    {
        _searchRepo = searchRepo;
    }

    [Function(nameof(IndexToSearchActivity))]
    public async Task Run(
        [ActivityTrigger] Orchestrations.IndexInput input,
        FunctionContext context)
    {
        var logger = context.GetLogger(nameof(IndexToSearchActivity));
        logger.LogInformation($"Indexing session {input.SessionId} to AI Search");

        await _searchRepo.IndexSessionAsync(
            input.SessionId,
            input.PiiMaskedText,
            input.SummaryKeyPoints);

        logger.LogInformation($"Indexing completed for session {input.SessionId}");
    }
}
