using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using FunctionsApp.Data;

namespace FunctionsApp.Activities;

public class IndexToSearchActivity
{
    private readonly ISearchRepository _searchRepo;

    public IndexToSearchActivity(ISearchRepository searchRepo)
    {
        _searchRepo = searchRepo;
    }

    [Function(nameof(IndexToSearchActivity))]
    public async Task Run(
        [ActivityTrigger] Shared.Session session,
        FunctionContext context)
    {
        var logger = context.GetLogger(nameof(IndexToSearchActivity));
        logger.LogInformation($"Indexing session {session.Id} to AI Search");

        await _searchRepo.IndexSessionAsync(session);

        logger.LogInformation($"Indexing completed for session {session.Id}");
    }
}
