using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.DurableTask.Client;
using Microsoft.Extensions.Logging;
using FunctionsApp.Data;
using FunctionsApp.Shared;
using System.Net;

namespace FunctionsApp.Http;

public class UploadAudio
{
    private readonly ICosmosRepository _cosmosRepo;
    private readonly IBlobRepository _blobRepo;

    public UploadAudio(ICosmosRepository cosmosRepo, IBlobRepository blobRepo)
    {
        _cosmosRepo = cosmosRepo;
        _blobRepo = blobRepo;
    }

    [Function(nameof(UploadAudio))]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "UploadAudio")] HttpRequestData req,
        [DurableClient] DurableTaskClient client,
        FunctionContext context)
    {
        var logger = context.GetLogger(nameof(UploadAudio));
        var traceId = Trace.GenerateTraceId();

        try
        {
            var claims = AuthZ.GetUserClaims(req);
            AuthZ.EnforceAuditorReadOnly(claims);

            // TODO: Multipart form data から音声ファイルと metadata を取得
            // 簡易実装（デモ用）
            var customerName = "デモ顧客";
            var consentGiven = true;

            if (!consentGiven)
            {
                var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequest.WriteAsJsonAsync(new { error = "Consent is required", traceId });
                return badRequest;
            }

            // Session 作成
            var sessionId = $"session-{Guid.NewGuid()}";
            var session = new Session
            {
                Id = sessionId,
                UserId = claims.UserId,
                StoreId = claims.StoreId,
                CustomerName = customerName,
                CreatedAt = DateTime.UtcNow,
                ConsentGiven = consentGiven,
                Status = "pending"
            };

            await _cosmosRepo.CreateSessionAsync(session);

            // 音声ファイルをBlobにアップロード
            var blobName = $"{sessionId}.wav";
            // TODO: 実際の音声ストリームをアップロード
            // await _blobRepo.UploadAudioAsync(blobName, audioStream);

            // Durable Orchestrator 起動
            var instanceId = await client.ScheduleNewOrchestrationInstanceAsync(
                nameof(Orchestrations.AnalyzeAudioOrchestrator),
                new Orchestrations.AnalyzeAudioInput
                {
                    SessionId = sessionId,
                    UserId = claims.UserId,
                    BlobName = blobName
                });

            logger.LogInformation($"Audio upload initiated for session {sessionId}, orchestration {instanceId}");

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new
            {
                sessionId,
                orchestrationId = instanceId,
                message = "Audio upload successful, analysis started",
                traceId
            });

            return response;
        }
        catch (Exception ex)
        {
            logger.LogError($"Upload failed: {ex.Message}");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = ex.Message, traceId });
            return errorResponse;
        }
    }
}
