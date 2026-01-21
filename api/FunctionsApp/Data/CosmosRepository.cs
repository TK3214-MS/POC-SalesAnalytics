using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;

namespace FunctionsApp.Data;

public class CosmosRepository : ICosmosRepository
{
    private readonly CosmosClient _client;
    private readonly Container _sessionsContainer;
    private readonly Container _auditContainer;

    public CosmosRepository(IConfiguration configuration)
    {
        var connectionString = configuration["CosmosDbConnectionString"]
            ?? throw new InvalidOperationException("CosmosDbConnectionString is required");
        var databaseName = configuration["CosmosDbDatabaseName"] ?? "SalesAnalytics";
        var sessionsContainerName = configuration["CosmosDbSessionsContainerName"] ?? "sessions";
        var auditContainerName = configuration["CosmosDbAuditContainerName"] ?? "label_audit";

        _client = new CosmosClient(connectionString);
        var database = _client.GetDatabase(databaseName);
        _sessionsContainer = database.GetContainer(sessionsContainerName);
        _auditContainer = database.GetContainer(auditContainerName);
    }

    // Sessions
    public async Task<Shared.Session> CreateSessionAsync(Shared.Session session)
    {
        var response = await _sessionsContainer.CreateItemAsync(session, new PartitionKey(session.UserId));
        return response.Resource;
    }

    public async Task<Shared.Session> GetSessionAsync(string id, string userId)
    {
        try
        {
            var response = await _sessionsContainer.ReadItemAsync<Shared.Session>(id, new PartitionKey(userId));
            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            throw new InvalidOperationException($"Session {id} not found");
        }
    }

    public async Task<Shared.Session> UpdateSessionAsync(Shared.Session session)
    {
        var response = await _sessionsContainer.ReplaceItemAsync(session, session.Id, new PartitionKey(session.UserId));
        return response.Resource;
    }

    public async Task<List<Shared.Session>> ListUserSessionsAsync(string userId, int limit = 100)
    {
        var query = new QueryDefinition("SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC OFFSET 0 LIMIT @limit")
            .WithParameter("@userId", userId)
            .WithParameter("@limit", limit);

        var iterator = _sessionsContainer.GetItemQueryIterator<Shared.Session>(query);
        var results = new List<Shared.Session>();

        while (iterator.HasMoreResults)
        {
            var response = await iterator.ReadNextAsync();
            results.AddRange(response);
        }

        return results;
    }

    public async Task<List<Shared.Session>> ListStoreSessionsAsync(string storeId, int limit = 100)
    {
        var query = new QueryDefinition("SELECT * FROM c WHERE c.storeId = @storeId ORDER BY c.createdAt DESC OFFSET 0 LIMIT @limit")
            .WithParameter("@storeId", storeId)
            .WithParameter("@limit", limit);

        var iterator = _sessionsContainer.GetItemQueryIterator<Shared.Session>(query);
        var results = new List<Shared.Session>();

        while (iterator.HasMoreResults)
        {
            var response = await iterator.ReadNextAsync();
            results.AddRange(response);
        }

        return results;
    }

    public async Task<List<Shared.Session>> ListPendingApprovalSessionsAsync(string storeId)
    {
        var query = new QueryDefinition(
            "SELECT * FROM c WHERE c.storeId = @storeId AND c.outcomeLabelRequest != null AND c.outcomeLabelRequest.status = 'pending'"
        ).WithParameter("@storeId", storeId);

        var iterator = _sessionsContainer.GetItemQueryIterator<Shared.Session>(query);
        var results = new List<Shared.Session>();

        while (iterator.HasMoreResults)
        {
            var response = await iterator.ReadNextAsync();
            results.AddRange(response);
        }

        return results;
    }

    // Audit Log (Append-only)
    public async Task<Shared.LabelAudit> AppendAuditLogAsync(Shared.LabelAudit audit)
    {
        var response = await _auditContainer.CreateItemAsync(audit, new PartitionKey(audit.SessionId));
        return response.Resource;
    }

    public async Task<List<Shared.LabelAudit>> GetAuditLogsAsync(string sessionId)
    {
        var query = new QueryDefinition("SELECT * FROM c WHERE c.sessionId = @sessionId ORDER BY c.timestamp DESC")
            .WithParameter("@sessionId", sessionId);

        var iterator = _auditContainer.GetItemQueryIterator<Shared.LabelAudit>(query);
        var results = new List<Shared.LabelAudit>();

        while (iterator.HasMoreResults)
        {
            var response = await iterator.ReadNextAsync();
            results.AddRange(response);
        }

        return results;
    }
}
