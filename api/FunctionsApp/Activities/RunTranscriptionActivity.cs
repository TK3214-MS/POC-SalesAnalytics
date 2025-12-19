using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using FunctionsApp.AI;
using FunctionsApp.Data;

namespace FunctionsApp.Activities;

public class RunTranscriptionActivity
{
    private readonly SpeechClient _speechClient;
    private readonly BlobRepository _blobRepo;

    public RunTranscriptionActivity(SpeechClient speechClient, BlobRepository blobRepo)
    {
        _speechClient = speechClient;
        _blobRepo = blobRepo;
    }

    [Function(nameof(RunTranscriptionActivity))]
    public async Task<Shared.Transcription> Run(
        [ActivityTrigger] Orchestrations.AnalyzeAudioInput input,
        FunctionContext context)
    {
        var logger = context.GetLogger(nameof(RunTranscriptionActivity));
        logger.LogInformation($"Running transcription for blob {input.BlobName}");

        using var audioStream = await _blobRepo.DownloadAudioAsync(input.BlobName);
        var transcription = await _speechClient.TranscribeWithDiarizationAsync(audioStream);

        logger.LogInformation($"Transcription completed with {transcription.Speakers.Count} speakers");
        return transcription;
    }
}
