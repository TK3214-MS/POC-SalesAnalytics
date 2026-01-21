namespace FunctionsApp.AI.Mock;

/// <summary>
/// デモモード用 OpenAI クライアント
/// </summary>
public class MockOpenAIClient : IOpenAIClient
{
    public async Task<Shared.Summary> SummarizeConversationAsync(string transcriptionText)
    {
        await Task.Delay(500);

        return new Shared.Summary
        {
            KeyPoints = new List<string>
            {
                "顧客は5人家族向けのSUVを探している",
                "予算は約400万円",
                "7人乗りの広々としたモデルに興味を示している",
                "燃費性能（リッター18km）を評価",
                "安全性能について質問あり"
            },
            Concerns = new List<string>
            {
                "安全性能の詳細確認が必要",
                "予算内で収まるかの検討中"
            },
            NextActions = new List<string>
            {
                "来週土曜日10時に試乗予約",
                "ローンプラン（月々4万円、頭金30万円）の詳細資料を準備",
                "安全性能の詳細説明資料を用意"
            },
            SuccessFactors = new List<string>
            {
                "顧客のニーズ（家族構成）をヒアリングできた",
                "予算感を確認し、適切なプランを提示",
                "具体的な次のステップ（試乗）に進めた"
            },
            ImprovementAreas = new List<string>
            {
                "安全性能についてもっと詳しく説明すべきだった",
                "競合車種との比較情報も提供すると良かった"
            },
            Quotations = new List<Shared.Quotation>
            {
                new Shared.Quotation 
                { 
                    SpeakerSegmentId = "seg-1-0", 
                    TimeRange = "3.5-6.0", 
                    Text = "家族向けのSUVを探しています。" 
                },
                new Shared.Quotation 
                { 
                    SpeakerSegmentId = "seg-1-4", 
                    TimeRange = "32.5-36.5", 
                    Text = "全部で400万円くらいを考えています。" 
                }
            }
        };
    }
}
