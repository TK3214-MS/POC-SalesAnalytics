namespace FunctionsApp.AI;

public interface IOpenAIClient
{
    Task<Shared.Summary> SummarizeConversationAsync(string transcriptionText);
}
