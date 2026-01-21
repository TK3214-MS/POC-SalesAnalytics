namespace FunctionsApp.AI;

public interface ILanguageClient
{
    Task<Shared.PiiMaskedData> RedactPiiAsync(string text);
    Task<Shared.SentimentData> AnalyzeSentimentAsync(string text);
}
