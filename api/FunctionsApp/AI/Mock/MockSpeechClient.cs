namespace FunctionsApp.AI.Mock;

/// <summary>
/// デモモード用 Speech クライアント
/// </summary>
public class MockSpeechClient : ISpeechClient
{
    public async Task<Shared.Transcription> TranscribeWithDiarizationAsync(Stream audioStream)
    {
        // シミュレート用の遅延
        await Task.Delay(500);

        return new Shared.Transcription
        {
            Speakers = new List<Shared.Speaker>
            {
                new Shared.Speaker
                {
                    Id = "spk-0",
                    Segments = new List<Shared.Segment>
                    {
                        new Shared.Segment { Id = "seg-0-0", Text = "いらっしゃいませ。本日はどのようなお車をお探しですか？", Start = 0.5, End = 3.2 },
                        new Shared.Segment { Id = "seg-0-1", Text = "ご家族構成は何名様でしょうか？", Start = 6.5, End = 8.3 },
                        new Shared.Segment { Id = "seg-0-2", Text = "それでしたら、こちらのSUVモデルはいかがでしょうか。7人乗りで広々としています。", Start = 12.0, End = 17.5 },
                        new Shared.Segment { Id = "seg-0-3", Text = "燃費も良く、リッター18キロメートルです。", Start = 18.0, End = 21.2 },
                        new Shared.Segment { Id = "seg-0-4", Text = "ご予算はどのくらいをお考えですか？", Start = 29.5, End = 32.0 },
                        new Shared.Segment { Id = "seg-0-5", Text = "それでしたら、月々4万円のローンプランがございます。頭金は30万円で可能です。", Start = 37.0, End = 43.5 },
                        new Shared.Segment { Id = "seg-0-6", Text = "試乗もご用意できますので、ぜひ一度乗っていただけますか？", Start = 45.0, End = 49.2 },
                        new Shared.Segment { Id = "seg-0-7", Text = "承知しました。来週の土曜日、10時でご予約をお取りします。お待ちしております！", Start = 54.5, End = 60.0 }
                    }
                },
                new Shared.Speaker
                {
                    Id = "spk-1",
                    Segments = new List<Shared.Segment>
                    {
                        new Shared.Segment { Id = "seg-1-0", Text = "こんにちは。家族向けのSUVを探しています。", Start = 3.5, End = 6.0 },
                        new Shared.Segment { Id = "seg-1-1", Text = "妻と子供3人の5人家族です。", Start = 8.5, End = 11.5 },
                        new Shared.Segment { Id = "seg-1-2", Text = "いいですね。詳しく教えてください。", Start = 17.8, End = 20.5 },
                        new Shared.Segment { Id = "seg-1-3", Text = "安全性能はどうですか？", Start = 21.5, End = 23.8 },
                        new Shared.Segment { Id = "seg-1-4", Text = "全部で400万円くらいを考えています。", Start = 32.5, End = 36.5 },
                        new Shared.Segment { Id = "seg-1-5", Text = "なるほど。検討してみます。", Start = 43.8, End = 46.5 },
                        new Shared.Segment { Id = "seg-1-6", Text = "はい、ぜひお願いします！", Start = 49.5, End = 51.8 },
                        new Shared.Segment { Id = "seg-1-7", Text = "ありがとうございました。", Start = 60.2, End = 62.0 }
                    }
                }
            }
        };
    }
}
