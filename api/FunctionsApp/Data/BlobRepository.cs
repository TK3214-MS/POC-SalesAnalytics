using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;

namespace FunctionsApp.Data;

public class BlobRepository : IBlobRepository
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

    public async Task<string> UploadAudioAsync(Stream stream, string fileName)
    {
        var blobClient = _containerClient.GetBlobClient(fileName);
        await blobClient.UploadAsync(stream, overwrite: true);
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
