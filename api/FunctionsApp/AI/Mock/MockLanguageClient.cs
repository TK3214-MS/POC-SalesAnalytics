namespace FunctionsApp.AI.Mock;

/// <summary>
/// デモモード用 Language クライアント
/// </summary>
public class MockLanguageClient : ILanguageClient
{
    public async Task<Shared.PiiMaskedData> RedactPiiAsync(string text)
    {
        await Task.Delay(300);

        // 簡易的なPII検出（デモ用）
        return new Shared.PiiMaskedData
        {
            FullText = text.Replace("田中", "****").Replace("太郎", "****"),
            Entities = new List<Shared.PiiEntity>
            {
                new Shared.PiiEntity { Type = "Person", Text = "田中太郎", RedactedText = "********" }
            }
        };
    }

    public async Task<Shared.SentimentData> AnalyzeSentimentAsync(string text)
    {
        await Task.Delay(300);

        // 簡易的な感情分析（デモ用）
        var segments = new List<Shared.SentimentSegment>
        {
            new Shared.SentimentSegment 
            { 
                Text = "いらっしゃいませ。本日はどのようなお車をお探しですか？", 
                Sentiment = "positive", 
                Confidence = 0.95 
            },
            new Shared.SentimentSegment 
            { 
                Text = "こんにちは。家族向けのSUVを探しています。", 
                Sentiment = "neutral", 
                Confidence = 0.88 
            },
            new Shared.SentimentSegment 
            { 
                Text = "それでしたら、こちらのSUVモデルはいかがでしょうか。", 
                Sentiment = "positive", 
                Confidence = 0.92 
            }
        };

        return new Shared.SentimentData
        {
            Overall = "positive",
            Segments = segments
        };
    }
}
