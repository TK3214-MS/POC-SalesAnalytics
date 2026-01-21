using Azure;
using Azure.AI.TextAnalytics;
using Microsoft.Extensions.Configuration;

namespace FunctionsApp.AI;

public class LanguageClient : ILanguageClient
{
    private readonly TextAnalyticsClient _client;

    public LanguageClient(IConfiguration configuration)
    {
        var endpoint = configuration["LanguageServiceEndpoint"]
            ?? throw new InvalidOperationException("LanguageServiceEndpoint is required");
        var key = configuration["LanguageServiceKey"]
            ?? throw new InvalidOperationException("LanguageServiceKey is required");

        _client = new TextAnalyticsClient(new Uri(endpoint), new AzureKeyCredential(key));
    }

    public async Task<Shared.PiiMaskedData> RedactPiiAsync(string text)
    {
        var response = await _client.RecognizePiiEntitiesAsync(text, language: "ja");
        var entities = response.Value;

        var maskedText = text;
        var piiEntities = new List<Shared.PiiEntity>();

        foreach (var entity in entities)
        {
            var redacted = $"[{entity.Category}]";
            maskedText = maskedText.Replace(entity.Text, redacted);

            piiEntities.Add(new Shared.PiiEntity
            {
                Type = entity.Category.ToString(),
                Text = entity.Text,
                RedactedText = redacted
            });
        }

        return new Shared.PiiMaskedData
        {
            FullText = maskedText,
            Entities = piiEntities
        };
    }

    public async Task<Shared.SentimentData> AnalyzeSentimentAsync(string text)
    {
        var response = await _client.AnalyzeSentimentAsync(text, language: "ja");
        var sentiment = response.Value;

        var segments = new List<Shared.SentimentSegment>();
        foreach (var sentence in sentiment.Sentences)
        {
            segments.Add(new Shared.SentimentSegment
            {
                Text = sentence.Text,
                Sentiment = sentence.Sentiment.ToString(),
                Confidence = sentence.ConfidenceScores.Positive
            });
        }

        return new Shared.SentimentData
        {
            Overall = sentiment.Sentiment.ToString(),
            Segments = segments
        };
    }
}
