using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using FunctionsApp.Data;
using FunctionsApp.Shared;

namespace FunctionsApp.Activities;

public class UploadToSharePointActivity
{
    private readonly SharePointRepository _sharePointRepo;
    private readonly CosmosRepository _cosmosRepo;

    public UploadToSharePointActivity(SharePointRepository sharePointRepo, CosmosRepository cosmosRepo)
    {
        _sharePointRepo = sharePointRepo;
        _cosmosRepo = cosmosRepo;
    }

    [Function(nameof(UploadToSharePointActivity))]
    public async Task<string> Run(
        [ActivityTrigger] UploadToSharePointInput input,
        FunctionContext context)
    {
        var logger = context.GetLogger(nameof(UploadToSharePointActivity));
        logger.LogInformation($"Uploading transcript to SharePoint for session {input.SessionId}");

        try
        {
            // セッション情報を取得
            var session = await _cosmosRepo.GetSessionAsync(input.SessionId, input.UserId);

            // Markdownを生成
            var markdown = TranscriptMarkdownGenerator.GenerateMarkdown(session);

            // ファイル名を生成（タイムスタンプ付き）
            var timestamp = session.CreatedAt.ToString("yyyyMMdd-HHmmss");
            var fileName = $"transcript_{session.StoreId}_{timestamp}_{session.Id}.md";

            // SharePointにアップロード
            var sharePointUrl = await _sharePointRepo.UploadTranscriptAsync(
                session.StoreId,
                fileName,
                markdown
            );

            logger.LogInformation($"Successfully uploaded transcript to SharePoint: {sharePointUrl}");

            return sharePointUrl;
        }
        catch (Exception ex)
        {
            logger.LogError($"Failed to upload transcript to SharePoint for session {input.SessionId}: {ex.Message}");
            throw;
        }
    }
}

public class UploadToSharePointInput
{
    public string SessionId { get; set; } = default!;
    public string UserId { get; set; } = default!;
}
