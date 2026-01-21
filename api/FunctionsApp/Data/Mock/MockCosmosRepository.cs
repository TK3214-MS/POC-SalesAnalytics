using System.Collections.Concurrent;

namespace FunctionsApp.Data.Mock;

/// <summary>
/// デモモード用インメモリ Cosmos DB リポジトリ
/// </summary>
public class MockCosmosRepository : ICosmosRepository
{
    private readonly ConcurrentDictionary<string, Shared.Session> _sessions = new();
    private readonly ConcurrentDictionary<string, List<Shared.LabelAudit>> _audits = new();

    public Task<Shared.Session> CreateSessionAsync(Shared.Session session)
    {
        _sessions[session.Id] = session;
        return Task.FromResult(session);
    }

    public Task<Shared.Session> GetSessionAsync(string id, string userId)
    {
        if (_sessions.TryGetValue(id, out var session) && session.UserId == userId)
        {
            return Task.FromResult(session);
        }
        throw new InvalidOperationException($"Session {id} not found");
    }

    public Task<Shared.Session> UpdateSessionAsync(Shared.Session session)
    {
        _sessions[session.Id] = session;
        return Task.FromResult(session);
    }

    public Task<List<Shared.Session>> ListUserSessionsAsync(string userId, int limit = 100)
    {
        var results = _sessions.Values
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .Take(limit)
            .ToList();
        return Task.FromResult(results);
    }

    public Task<List<Shared.Session>> ListStoreSessionsAsync(string storeId, int limit = 100)
    {
        var results = _sessions.Values
            .Where(s => s.StoreId == storeId)
            .OrderByDescending(s => s.CreatedAt)
            .Take(limit)
            .ToList();
        return Task.FromResult(results);
    }

    public Task<List<Shared.Session>> ListPendingApprovalSessionsAsync(string storeId)
    {
        var results = _sessions.Values
            .Where(s => s.StoreId == storeId 
                && s.OutcomeLabelRequest != null 
                && s.OutcomeLabelRequest.Status == "pending")
            .ToList();
        return Task.FromResult(results);
    }

    public Task<Shared.LabelAudit> AppendAuditLogAsync(Shared.LabelAudit audit)
    {
        if (!_audits.ContainsKey(audit.SessionId))
        {
            _audits[audit.SessionId] = new List<Shared.LabelAudit>();
        }
        _audits[audit.SessionId].Add(audit);
        return Task.FromResult(audit);
    }

    public Task<List<Shared.LabelAudit>> GetAuditLogsAsync(string sessionId)
    {
        if (_audits.TryGetValue(sessionId, out var logs))
        {
            return Task.FromResult(logs.OrderByDescending(a => a.Timestamp).ToList());
        }
        return Task.FromResult(new List<Shared.LabelAudit>());
    }
}
