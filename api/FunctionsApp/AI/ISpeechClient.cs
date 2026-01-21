namespace FunctionsApp.AI;

public interface ISpeechClient
{
    Task<Shared.Transcription> TranscribeWithDiarizationAsync(Stream audioStream);
}
