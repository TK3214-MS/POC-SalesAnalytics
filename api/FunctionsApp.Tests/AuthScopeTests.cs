using Xunit;
using FunctionsApp.Shared;

namespace FunctionsApp.Tests;

public class AuthScopeTests
{
    [Fact]
    public void Sales_自分のセッションのみアクセス可能()
    {
        // Arrange
        var claims = new UserClaims
        {
            UserId = "user-sales-001",
            Role = "Sales",
            StoreId = "store-tokyo-001"
        };

        var ownSession = new Session
        {
            Id = "session-1",
            UserId = "user-sales-001",
            StoreId = "store-tokyo-001"
        };

        var otherSession = new Session
        {
            Id = "session-2",
            UserId = "user-sales-002",
            StoreId = "store-tokyo-001"
        };

        // Act & Assert
        AuthZ.EnforceSalesScope(claims, ownSession); // 成功

        Assert.Throws<UnauthorizedAccessException>(() =>
            AuthZ.EnforceSalesScope(claims, otherSession));
    }

    [Fact]
    public void Manager_同一店舗のみアクセス可能()
    {
        // Arrange
        var claims = new UserClaims
        {
            UserId = "user-manager-001",
            Role = "Manager",
            StoreId = "store-tokyo-001"
        };

        var sameStoreSession = new Session
        {
            Id = "session-1",
            StoreId = "store-tokyo-001"
        };

        var differentStoreSession = new Session
        {
            Id = "session-2",
            StoreId = "store-osaka-001"
        };

        // Act & Assert
        AuthZ.EnforceManagerStoreScope(claims, sameStoreSession); // 成功

        Assert.Throws<UnauthorizedAccessException>(() =>
            AuthZ.EnforceManagerStoreScope(claims, differentStoreSession));
    }

    [Fact]
    public void Auditor_読み取り専用()
    {
        // Arrange
        var claims = new UserClaims
        {
            UserId = "user-auditor-001",
            Role = "Auditor",
            StoreId = "store-tokyo-001"
        };

        // Act & Assert
        Assert.Throws<UnauthorizedAccessException>(() =>
            AuthZ.EnforceAuditorReadOnly(claims));
    }
}
