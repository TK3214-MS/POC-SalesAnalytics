using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace FunctionsApp.AI;

public class SpeechClient
{
    private readonly string _endpoint;
    private readonly string _key;
    private readonly HttpClient _httpClient;

    public SpeechClient(IConfiguration configuration)
    {
        _endpoint = configuration["SpeechServiceEndpoint"]
            ?? throw new InvalidOperationException("SpeechServiceEndpoint is required");
        _key = configuration["SpeechServiceKey"]
            ?? throw new InvalidOperationException("SpeechServiceKey is required");

        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", _key);
    }

    public async Task<Shared.Transcription> TranscribeWithDiarizationAsync(Stream audioStream)
    {
        // TODO: Azure AI Speech Batch API を使用して話者分離付き文字起こしを実行
        // 実装: https://learn.microsoft.com/azure/ai-services/speech-service/batch-transcription

        // ダミー実装（デモ用）
        await Task.Delay(100);

        return new Shared.Transcription
        {
            Speakers = new List<Shared.Speaker>
            {
                new Shared.Speaker
                {
                    Id = "spk-0",
                    Segments = new List<Shared.Segment>
                    {
                        new Shared.Segment { Id = "seg-0-0", Text = "いらっしゃいませ。本日はどのようなお車をお探しですか？", Start = 0.5, End = 3.2 }
                    }
                },
                new Shared.Speaker
                {
                    Id = "spk-1",
                    Segments = new List<Shared.Segment>
                    {
                        new Shared.Segment { Id = "seg-1-0", Text = "こんにちは。家族向けのSUVを探しています。", Start = 3.5, End = 6.0 }
                    }
                }
            }
        };
    }

    // TODO: 実装例（Batch Transcription API）
    // 1. Blob に音声ファイルをアップロード
    // 2. POST /speechtotext/v3.1/transcriptions で Batch ジョブを作成
    // 3. ジョブIDをポーリングして完了を待つ
    // 4. 結果JSONから話者分離結果を取得
}
