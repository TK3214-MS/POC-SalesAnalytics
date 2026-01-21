namespace FunctionsApp.Data;

public interface ISharePointRepository
{
    Task<string> UploadDocumentAsync(string fileName, string content);
    Task<string> UploadTranscriptAsync(string storeId, string fileName, string markdownContent);
}
