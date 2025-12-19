using System.Diagnostics;

namespace FunctionsApp.Shared;

public static class Trace
{
    public static string GenerateTraceId()
    {
        return Activity.Current?.Id ?? Guid.NewGuid().ToString();
    }

    public static Dictionary<string, object> EnrichLog(string traceId, string action, object? metadata = null)
    {
        var log = new Dictionary<string, object>
        {
            ["traceId"] = traceId,
            ["action"] = action,
            ["timestamp"] = DateTime.UtcNow
        };

        if (metadata != null)
        {
            log["metadata"] = metadata;
        }

        return log;
    }
}
