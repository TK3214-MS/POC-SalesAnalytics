using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;

namespace FunctionsApp.Data;

public class BlobRepository
{
    private readonly BlobContainerClient _containerClient;

    public BlobRepository(IConfiguration configuration)
    {
        var connectionString = configuration["BlobStorageConnectionString"]
            ?? throw new InvalidOperationException("BlobStorageConnectionString is required");
        var containerName = configuration["BlobContainerName"] ?? "audio-uploads";

        var blobServiceClient = new BlobServiceClient(connectionString);
        _containerClient = blobServiceClient.GetBlobContainerClient(containerName);
        _containerClient.CreateIfNotExists();
    }

    public async Task<string> UploadAudioAsync(string blobName, Stream audioStream)
    {
        var blobClient = _containerClient.GetBlobClient(blobName);
        await blobClient.UploadAsync(audioStream, overwrite: true);
        return blobClient.Uri.ToString();
    }

    public async Task<Stream> DownloadAudioAsync(string blobName)
    {
        var blobClient = _containerClient.GetBlobClient(blobName);
        var response = await blobClient.DownloadAsync();
        return response.Value.Content;
    }

    public async Task DeleteAudioAsync(string blobName)
    {
        var blobClient = _containerClient.GetBlobClient(blobName);
        await blobClient.DeleteIfExistsAsync();
    }
}
