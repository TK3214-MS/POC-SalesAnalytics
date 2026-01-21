namespace FunctionsApp.Data;

public interface ICosmosRepository
{
    // Sessions
    Task<Shared.Session> CreateSessionAsync(Shared.Session session);
    Task<Shared.Session> GetSessionAsync(string id, string userId);
    Task<Shared.Session> UpdateSessionAsync(Shared.Session session);
    Task<List<Shared.Session>> ListUserSessionsAsync(string userId, int limit = 100);
    Task<List<Shared.Session>> ListStoreSessionsAsync(string storeId, int limit = 100);
    Task<List<Shared.Session>> ListPendingApprovalSessionsAsync(string storeId);

    // Audit Log
    Task<Shared.LabelAudit> AppendAuditLogAsync(Shared.LabelAudit audit);
    Task<List<Shared.LabelAudit>> GetAuditLogsAsync(string sessionId);
}
