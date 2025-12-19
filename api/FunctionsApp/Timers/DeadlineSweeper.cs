using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using FunctionsApp.Data;

namespace FunctionsApp.Timers;

public class DeadlineSweeper
{
    private readonly CosmosRepository _cosmosRepo;

    public DeadlineSweeper(CosmosRepository cosmosRepo)
    {
        _cosmosRepo = cosmosRepo;
    }

    [Function(nameof(DeadlineSweeper))]
    public async Task Run(
        [TimerTrigger("0 0 0 * * *")] TimerInfo timer, // 毎日0時に実行
        FunctionContext context)
    {
        var logger = context.GetLogger(nameof(DeadlineSweeper));
        logger.LogInformation("DeadlineSweeper started");

        // TODO: 期限超過セッションの検知と通知
        // 1. Cosmos DB から outcomeLabel == null かつ createdAt が7日以上前のセッションを取得
        // 2. Manager に通知（Email / Teams）
        // 3. 監査ログに DEADLINE_EXCEEDED を記録

        logger.LogInformation("DeadlineSweeper completed");
    }
}
