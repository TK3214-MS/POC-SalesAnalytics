using Microsoft.Azure.Functions.Worker.Http;
using System.Security.Claims;

namespace FunctionsApp.Shared;

public static class AuthZ
{
    public static UserClaims GetUserClaims(HttpRequestData req)
    {
        // TODO: Azure AD B2C / Entra ID JWT トークンから claims を取得
        // 本番環境では req.Headers["Authorization"] から JWT を取得し、検証する

        // デモ用（開発環境）
        return new UserClaims
        {
            UserId = "user-demo-001",
            Email = "demo@example.com",
            Role = "Sales", // Sales, Manager, Auditor
            StoreId = "store-tokyo-001"
        };
    }

    public static void EnforceSalesScope(UserClaims claims, Session session)
    {
        if (claims.Role == "Sales" && session.UserId != claims.UserId)
        {
            throw new UnauthorizedAccessException("Sales can only access their own sessions");
        }
    }

    public static void EnforceManagerStoreScope(UserClaims claims, Session session)
    {
        if (claims.Role == "Manager" && session.StoreId != claims.StoreId)
        {
            throw new UnauthorizedAccessException("Manager can only access sessions in their store");
        }
    }

    public static void EnforceAuditorReadOnly(UserClaims claims)
    {
        if (claims.Role == "Auditor")
        {
            throw new UnauthorizedAccessException("Auditor role is read-only");
        }
    }

    public static bool IsDeadlineExceeded(Session session)
    {
        var deadlineDays = 7;
        var deadline = session.CreatedAt.AddDays(deadlineDays);
        return DateTime.UtcNow > deadline;
    }

    public static int GetRemainingDays(Session session)
    {
        var deadlineDays = 7;
        var deadline = session.CreatedAt.AddDays(deadlineDays);
        var remaining = (deadline - DateTime.UtcNow).Days;
        return Math.Max(0, remaining);
    }
}
