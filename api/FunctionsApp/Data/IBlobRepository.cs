namespace FunctionsApp.Data;

public interface IBlobRepository
{
    Task<string> UploadAudioAsync(Stream stream, string fileName);
    Task<Stream> DownloadAudioAsync(string blobName);
    Task DeleteAudioAsync(string blobName);
}
