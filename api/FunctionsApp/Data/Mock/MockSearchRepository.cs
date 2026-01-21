namespace FunctionsApp.Data.Mock;

/// <summary>
/// デモモード用 Azure Search リポジトリ
/// </summary>
public class MockSearchRepository : ISearchRepository
{
    public Task IndexSessionAsync(Shared.Session session)
    {
        // デモモードではインデックス化をスキップ（ログ出力のみ）
        Console.WriteLine($"[DEMO] Indexed session: {session.Id}");
        return Task.CompletedTask;
    }
}
