using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using FunctionsApp.AI;

namespace FunctionsApp.Activities;

public class RunSummarizationActivity
{
    private readonly IOpenAIClient _openAIClient;

    public RunSummarizationActivity(IOpenAIClient openAIClient)
    {
        _openAIClient = openAIClient;
    }

    [Function(nameof(RunSummarizationActivity))]
    public async Task<Shared.Summary> Run(
        [ActivityTrigger] string piiMaskedText,
        FunctionContext context)
    {
        var logger = context.GetLogger(nameof(RunSummarizationActivity));
        logger.LogInformation("Running LLM summarization");

        var summary = await _openAIClient.SummarizeConversationAsync(piiMaskedText);

        logger.LogInformation($"Summarization completed with {summary.KeyPoints.Count} key points");
        return summary;
    }
}
