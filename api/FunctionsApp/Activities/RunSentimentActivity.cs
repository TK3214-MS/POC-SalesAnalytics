using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using FunctionsApp.AI;

namespace FunctionsApp.Activities;

public class RunSentimentActivity
{
    private readonly ILanguageClient _languageClient;

    public RunSentimentActivity(ILanguageClient languageClient)
    {
        _languageClient = languageClient;
    }

    [Function(nameof(RunSentimentActivity))]
    public async Task<Shared.SentimentData> Run(
        [ActivityTrigger] string piiMaskedText,
        FunctionContext context)
    {
        var logger = context.GetLogger(nameof(RunSentimentActivity));
        logger.LogInformation("Running sentiment analysis");

        var sentiment = await _languageClient.AnalyzeSentimentAsync(piiMaskedText);

        logger.LogInformation($"Sentiment analysis completed: {sentiment.Overall}");
        return sentiment;
    }
}
