namespace FunctionsApp.Data.Mock;

/// <summary>
/// デモモード用 SharePoint リポジトリ
/// </summary>
public class MockSharePointRepository : ISharePointRepository
{
    public Task<string> UploadDocumentAsync(string fileName, string content)
    {
        // デモモードでは擬似URLを返す
        var mockUrl = $"https://demo-sharepoint.sharepoint.com/sites/SalesAnalytics/Documents/{fileName}";
        Console.WriteLine($"[DEMO] Uploaded document: {mockUrl}");
        return Task.FromResult(mockUrl);
    }

    public Task<string> UploadTranscriptAsync(string storeId, string fileName, string markdownContent)
    {
        // デモモードでは擬似URLを返す
        var mockUrl = $"https://demo-sharepoint.sharepoint.com/sites/SalesAnalytics/{storeId}/{fileName}";
        Console.WriteLine($"[DEMO] Uploaded transcript: {mockUrl}");
        return Task.FromResult(mockUrl);
    }
}
