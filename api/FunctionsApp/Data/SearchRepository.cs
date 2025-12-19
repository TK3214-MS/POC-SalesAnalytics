using Azure;
using Azure.Search.Documents;
using Azure.Search.Documents.Indexes;
using Azure.Search.Documents.Models;
using Microsoft.Extensions.Configuration;

namespace FunctionsApp.Data;

public class SearchRepository
{
    private readonly SearchClient _searchClient;
    private readonly SearchIndexClient _indexClient;

    public SearchRepository(IConfiguration configuration)
    {
        var endpoint = configuration["SearchServiceEndpoint"]
            ?? throw new InvalidOperationException("SearchServiceEndpoint is required");
        var key = configuration["SearchServiceKey"]
            ?? throw new InvalidOperationException("SearchServiceKey is required");
        var indexName = configuration["SearchIndexName"] ?? "sessions-index";

        var credential = new AzureKeyCredential(key);
        _indexClient = new SearchIndexClient(new Uri(endpoint), credential);
        _searchClient = _indexClient.GetSearchClient(indexName);
    }

    public async Task IndexSessionAsync(string sessionId, string piiMaskedText, string summaryKeyPoints)
    {
        var document = new SearchDocument
        {
            ["id"] = sessionId,
            ["piiMaskedText"] = piiMaskedText,
            ["summaryKeyPoints"] = summaryKeyPoints,
            // TODO: ベクトル埋め込み（text-embedding-ada-002 等）を追加
            // ["embedding"] = await GenerateEmbeddingAsync(piiMaskedText)
        };

        await _searchClient.UploadDocumentsAsync(new[] { document });
    }

    public async Task<List<string>> SearchSimilarSessionsAsync(string query, int topK = 5)
    {
        // TODO: Hybrid Search (keyword + vector) を実装
        var options = new SearchOptions
        {
            Size = topK,
            Select = { "id" }
        };

        var results = await _searchClient.SearchAsync<SearchDocument>(query, options);
        var sessionIds = new List<string>();

        await foreach (var result in results.Value.GetResultsAsync())
        {
            sessionIds.Add(result.Document["id"].ToString()!);
        }

        return sessionIds;
    }

    // TODO: ベクトル埋め込み生成
    // private async Task<float[]> GenerateEmbeddingAsync(string text)
    // {
    //     // Azure OpenAI text-embedding-ada-002 を呼び出す
    //     return new float[1536]; // dummy
    // }
}
