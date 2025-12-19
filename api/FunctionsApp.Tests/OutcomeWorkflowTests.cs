using Xunit;
using FunctionsApp.Shared;

namespace FunctionsApp.Tests;

public class OutcomeWorkflowTests
{
    [Fact]
    public void Outcome_二段階承認_正常系()
    {
        // Arrange
        var session = new Session
        {
            Id = "session-test",
            UserId = "user-sales",
            StoreId = "store-tokyo-001",
            CreatedAt = DateTime.UtcNow,
            OutcomeLabel = null
        };

        var request = new OutcomeLabelRequest
        {
            Id = "req-test",
            RequestedBy = "user-sales",
            RequestedAt = DateTime.UtcNow,
            Outcome = "won",
            Status = "pending"
        };

        // Act
        session.OutcomeLabelRequest = request;

        // Assert
        Assert.NotNull(session.OutcomeLabelRequest);
        Assert.Equal("pending", session.OutcomeLabelRequest.Status);
        Assert.Null(session.OutcomeLabel);
    }

    [Fact]
    public void Outcome_期限内チェック()
    {
        // Arrange
        var session = new Session
        {
            Id = "session-test",
            CreatedAt = DateTime.UtcNow.AddDays(-5)
        };

        // Act
        var isExpired = AuthZ.IsDeadlineExceeded(session);
        var remainingDays = AuthZ.GetRemainingDays(session);

        // Assert
        Assert.False(isExpired);
        Assert.True(remainingDays >= 0 && remainingDays <= 7);
    }

    [Fact]
    public void Outcome_期限超過チェック()
    {
        // Arrange
        var session = new Session
        {
            Id = "session-test",
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        };

        // Act
        var isExpired = AuthZ.IsDeadlineExceeded(session);

        // Assert
        Assert.True(isExpired);
    }
}
