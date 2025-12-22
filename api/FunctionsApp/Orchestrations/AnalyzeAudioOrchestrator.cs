using Microsoft.Azure.Functions.Worker;
using Microsoft.DurableTask;
using Microsoft.Extensions.Logging;
using FunctionsApp.Data;
using FunctionsApp.AI;

namespace FunctionsApp.Orchestrations;

public class AnalyzeAudioOrchestrator
{
    private readonly CosmosRepository _cosmosRepo;
    private readonly BlobRepository _blobRepo;

    public AnalyzeAudioOrchestrator(CosmosRepository cosmosRepo, BlobRepository blobRepo)
    {
        _cosmosRepo = cosmosRepo;
        _blobRepo = blobRepo;
    }

    [Function(nameof(AnalyzeAudioOrchestrator))]
    public async Task RunOrchestrator(
        [OrchestrationTrigger] TaskOrchestrationContext context)
    {
        var logger = context.CreateReplaySafeLogger(nameof(AnalyzeAudioOrchestrator));
        var input = context.GetInput<AnalyzeAudioInput>()!;

        logger.LogInformation($"Starting audio analysis orchestration for session {input.SessionId}");

        try
        {
            // 1. 文字起こし（話者分離）
            var transcription = await context.CallActivityAsync<Shared.Transcription>(
                nameof(Activities.RunTranscriptionActivity),
                input);

            // 2. PII マスキング
            var piiMasked = await context.CallActivityAsync<Shared.PiiMaskedData>(
                nameof(Activities.RunPiiRedactionActivity),
                transcription);

            // 3. 感情分析
            var sentiment = await context.CallActivityAsync<Shared.SentimentData>(
                nameof(Activities.RunSentimentActivity),
                piiMasked.FullText);

            // 4. LLM 要約
            var summary = await context.CallActivityAsync<Shared.Summary>(
                nameof(Activities.RunSummarizationActivity),
                piiMasked.FullText);

            // 5. AI Search 索引化
            await context.CallActivityAsync(
                nameof(Activities.IndexToSearchActivity),
                new IndexInput
                {
                    SessionId = input.SessionId,
                    PiiMaskedText = piiMasked.FullText,
                    SummaryKeyPoints = string.Join(" ", summary.KeyPoints)
                });

            // 6. SharePoint にトランスクリプトをアップロード
            string? sharePointUrl = null;
            try
            {
                sharePointUrl = await context.CallActivityAsync<string>(
                    nameof(Activities.UploadToSharePointActivity),
                    new Activities.UploadToSharePointInput
                    {
                        SessionId = input.SessionId,
                        UserId = input.UserId
                    });
                
                logger.LogInformation($"Transcript uploaded to SharePoint: {sharePointUrl}");
            }
            catch (Exception ex)
            {
                // SharePointアップロードが失敗してもオーケストレーション全体は失敗させない
                logger.LogWarning($"Failed to upload to SharePoint (non-critical): {ex.Message}");
            }

            // 7. Session 更新（完了）
            var session = await _cosmosRepo.GetSessionAsync(input.SessionId, input.UserId);
            session.Status = "completed";
            session.Transcription = transcription;
            session.PiiMasked = piiMasked;
            session.Sentiment = sentiment;
            session.Summary = summary;
            session.SharePointUrl = sharePointUrl;
            await _cosmosRepo.UpdateSessionAsync(session);

            // 8. 音声原本削除
            if (!string.IsNullOrEmpty(input.BlobName))
            {
                await _blobRepo.DeleteAudioAsync(input.BlobName);
            }

            logger.LogInformation($"Audio analysis completed for session {input.SessionId}");
        }
        catch (Exception ex)
        {
            logger.LogError($"Audio analysis failed for session {input.SessionId}: {ex.Message}");

            // エラー時のステータス更新
            var session = await _cosmosRepo.GetSessionAsync(input.SessionId, input.UserId);
            session.Status = "failed";
            await _cosmosRepo.UpdateSessionAsync(session);

            throw;
        }
    }
}

public class AnalyzeAudioInput
{
    public string SessionId { get; set; } = default!;
    public string UserId { get; set; } = default!;
    public string BlobName { get; set; } = default!;
}

public class IndexInput
{
    public string SessionId { get; set; } = default!;
    public string PiiMaskedText { get; set; } = default!;
    public string SummaryKeyPoints { get; set; } = default!;
}
