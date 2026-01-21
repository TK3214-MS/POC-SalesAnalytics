using System.Collections.Concurrent;

namespace FunctionsApp.Data.Mock;

/// <summary>
/// デモモード用インメモリ Blob ストレージ
/// </summary>
public class MockBlobRepository : IBlobRepository
{
    private readonly ConcurrentDictionary<string, byte[]> _blobs = new();

    public async Task<string> UploadAudioAsync(Stream stream, string fileName)
    {
        using var ms = new MemoryStream();
        await stream.CopyToAsync(ms);
        _blobs[fileName] = ms.ToArray();
        
        return $"https://demo-storage.blob.core.windows.net/audio/{fileName}";
    }

    public Task<Stream> DownloadAudioAsync(string blobName)
    {
        if (_blobs.TryGetValue(blobName, out var data))
        {
            return Task.FromResult<Stream>(new MemoryStream(data));
        }
        throw new InvalidOperationException($"Blob {blobName} not found");
    }

    public Task DeleteAudioAsync(string blobName)
    {
        _blobs.TryRemove(blobName, out _);
        Console.WriteLine($"[DEMO] Deleted audio blob: {blobName}");
        return Task.CompletedTask;
    }
}
