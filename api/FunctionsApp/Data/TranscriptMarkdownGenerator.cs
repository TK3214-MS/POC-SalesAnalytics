using System.Text;
using FunctionsApp.Shared;

namespace FunctionsApp.Data;

public static class TranscriptMarkdownGenerator
{
    /// <summary>
    /// セッション情報から営業ロールプレイ用のMarkdownを生成
    /// </summary>
    public static string GenerateMarkdown(Session session)
    {
        var sb = new StringBuilder();

        // ヘッダー
        sb.AppendLine("# 営業トランスクリプト - ロールプレイ教材");
        sb.AppendLine();
        sb.AppendLine($"**生成日時**: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
        sb.AppendLine();

        // 基本情報セクション
        AppendBasicInfo(sb, session);
        sb.AppendLine();

        // 会話トランスクリプトセクション
        AppendTranscript(sb, session);
        sb.AppendLine();

        // 感情分析セクション
        AppendSentimentAnalysis(sb, session);
        sb.AppendLine();

        // AI要約セクション
        AppendSummary(sb, session);
        sb.AppendLine();

        // 成約結果セクション
        AppendOutcome(sb, session);
        sb.AppendLine();

        // ロールプレイガイドセクション
        AppendRolePlayGuide(sb, session);

        return sb.ToString();
    }

    private static void AppendBasicInfo(StringBuilder sb, Session session)
    {
        sb.AppendLine("## 📋 基本情報");
        sb.AppendLine();
        sb.AppendLine("| 項目 | 内容 |");
        sb.AppendLine("|------|------|");
        sb.AppendLine($"| セッションID | `{session.Id}` |");
        sb.AppendLine($"| 商談日時 | {session.CreatedAt:yyyy年MM月dd日 HH:mm} |");
        sb.AppendLine($"| 店舗ID | {session.StoreId} |");
        sb.AppendLine($"| 販売員ID | {session.UserId} |");
        sb.AppendLine($"| 顧客名 | {session.CustomerName} |");
        sb.AppendLine($"| ステータス | {session.Status} |");
    }

    private static void AppendTranscript(StringBuilder sb, Session session)
    {
        sb.AppendLine("## 💬 会話トランスクリプト");
        sb.AppendLine();

        if (session.Transcription?.Speakers == null || !session.Transcription.Speakers.Any())
        {
            sb.AppendLine("*トランスクリプトデータがありません*");
            return;
        }

        sb.AppendLine("> **話者分離**: Azure AI Speech により自動的に話者を識別しています");
        sb.AppendLine();

        // 全セグメントを時系列順に並べる
        var allSegments = session.Transcription.Speakers
            .SelectMany(speaker => speaker.Segments.Select(seg => new
            {
                SpeakerId = speaker.Id,
                Segment = seg
            }))
            .OrderBy(x => x.Segment.Start)
            .ToList();

        foreach (var item in allSegments)
        {
            var speakerLabel = GetSpeakerLabel(item.SpeakerId);
            var timeRange = FormatTimeRange(item.Segment.Start, item.Segment.End);
            
            sb.AppendLine($"### {speakerLabel} `[{timeRange}]`");
            sb.AppendLine();
            sb.AppendLine($"> {item.Segment.Text}");
            sb.AppendLine();
        }
    }

    private static void AppendSentimentAnalysis(StringBuilder sb, Session session)
    {
        sb.AppendLine("## 📊 感情分析");
        sb.AppendLine();

        if (session.Sentiment == null)
        {
            sb.AppendLine("*感情分析データがありません*");
            return;
        }

        sb.AppendLine($"**全体的な感情**: {GetSentimentEmoji(session.Sentiment.Overall)} {GetSentimentLabel(session.Sentiment.Overall)}");
        sb.AppendLine();

        if (session.Sentiment.Segments != null && session.Sentiment.Segments.Any())
        {
            sb.AppendLine("### セグメント別感情");
            sb.AppendLine();
            sb.AppendLine("| テキスト | 感情 | 信頼度 |");
            sb.AppendLine("|----------|------|--------|");

            foreach (var seg in session.Sentiment.Segments.Take(10)) // 最初の10件
            {
                var textPreview = seg.Text.Length > 50 
                    ? seg.Text.Substring(0, 47) + "..." 
                    : seg.Text;
                var emoji = GetSentimentEmoji(seg.Sentiment);
                var confidence = $"{seg.Confidence * 100:F1}%";
                
                sb.AppendLine($"| {textPreview} | {emoji} {seg.Sentiment} | {confidence} |");
            }
            sb.AppendLine();
        }
    }

    private static void AppendSummary(StringBuilder sb, Session session)
    {
        sb.AppendLine("## 🎯 AI要約");
        sb.AppendLine();

        if (session.Summary == null)
        {
            sb.AppendLine("*要約データがありません*");
            return;
        }

        // キーポイント
        if (session.Summary.KeyPoints != null && session.Summary.KeyPoints.Any())
        {
            sb.AppendLine("### ✅ キーポイント");
            sb.AppendLine();
            foreach (var point in session.Summary.KeyPoints)
            {
                sb.AppendLine($"- {point}");
            }
            sb.AppendLine();
        }

        // 成功要因
        if (session.Summary.SuccessFactors != null && session.Summary.SuccessFactors.Any())
        {
            sb.AppendLine("### 🌟 成功要因");
            sb.AppendLine();
            foreach (var factor in session.Summary.SuccessFactors)
            {
                sb.AppendLine($"- {factor}");
            }
            sb.AppendLine();
        }

        // 改善点
        if (session.Summary.ImprovementAreas != null && session.Summary.ImprovementAreas.Any())
        {
            sb.AppendLine("### 🔧 改善点");
            sb.AppendLine();
            foreach (var area in session.Summary.ImprovementAreas)
            {
                sb.AppendLine($"- {area}");
            }
            sb.AppendLine();
        }

        // 懸念事項
        if (session.Summary.Concerns != null && session.Summary.Concerns.Any())
        {
            sb.AppendLine("### ⚠️ 懸念事項");
            sb.AppendLine();
            foreach (var concern in session.Summary.Concerns)
            {
                sb.AppendLine($"- {concern}");
            }
            sb.AppendLine();
        }

        // ネクストアクション
        if (session.Summary.NextActions != null && session.Summary.NextActions.Any())
        {
            sb.AppendLine("### 📌 ネクストアクション");
            sb.AppendLine();
            foreach (var action in session.Summary.NextActions)
            {
                sb.AppendLine($"- {action}");
            }
            sb.AppendLine();
        }

        // 重要な引用
        if (session.Summary.Quotations != null && session.Summary.Quotations.Any())
        {
            sb.AppendLine("### 💡 重要な発言");
            sb.AppendLine();
            foreach (var quote in session.Summary.Quotations)
            {
                sb.AppendLine($"> **[{quote.TimeRange}]** {quote.Text}");
                sb.AppendLine();
            }
        }
    }

    private static void AppendOutcome(StringBuilder sb, Session session)
    {
        sb.AppendLine("## 📈 成約結果");
        sb.AppendLine();

        if (string.IsNullOrEmpty(session.OutcomeLabel))
        {
            sb.AppendLine("**ステータス**: ⏳ 未確定");
            sb.AppendLine();

            if (session.OutcomeLabelRequest != null)
            {
                sb.AppendLine($"- 申請状況: {session.OutcomeLabelRequest.Status}");
                sb.AppendLine($"- 申請者: {session.OutcomeLabelRequest.RequestedBy}");
                sb.AppendLine($"- 申請日時: {session.OutcomeLabelRequest.RequestedAt:yyyy-MM-dd HH:mm}");
                sb.AppendLine($"- 申請内容: {session.OutcomeLabelRequest.Outcome}");
                if (!string.IsNullOrEmpty(session.OutcomeLabelRequest.Reason))
                {
                    sb.AppendLine($"- 理由: {session.OutcomeLabelRequest.Reason}");
                }
            }
        }
        else
        {
            var outcomeEmoji = session.OutcomeLabel.ToLower() switch
            {
                "won" => "✅",
                "lost" => "❌",
                "pending" => "⏳",
                "canceled" => "🚫",
                _ => "❓"
            };

            var outcomeLabel = session.OutcomeLabel.ToLower() switch
            {
                "won" => "成約",
                "lost" => "失注",
                "pending" => "保留",
                "canceled" => "キャンセル",
                _ => session.OutcomeLabel
            };

            sb.AppendLine($"**ステータス**: {outcomeEmoji} {outcomeLabel}");
        }
        sb.AppendLine();
    }

    private static void AppendRolePlayGuide(StringBuilder sb, Session session)
    {
        sb.AppendLine("## 🎭 ロールプレイガイド");
        sb.AppendLine();
        sb.AppendLine("### 活用方法");
        sb.AppendLine();
        sb.AppendLine("このトランスクリプトは、**Copilot Studio Lite**を活用した営業ロールプレイの教材として使用できます。");
        sb.AppendLine();
        sb.AppendLine("#### 推奨される活用シナリオ:");
        sb.AppendLine();
        sb.AppendLine("1. **実践的なシミュレーション**");
        sb.AppendLine("   - 実際の商談をもとにしたリアルな会話練習");
        sb.AppendLine("   - 成功パターンの再現と改善点の克服");
        sb.AppendLine();
        sb.AppendLine("2. **AI エージェントとの対話練習**");
        sb.AppendLine("   - Copilot Studio Liteがこのトランスクリプトを参照");
        sb.AppendLine("   - 顧客役として自然な応答を生成");
        sb.AppendLine("   - 販売員のスキル向上をサポート");
        sb.AppendLine();
        sb.AppendLine("3. **フィードバックの提供**");
        sb.AppendLine("   - AIが改善点や成功要因を分析");
        sb.AppendLine("   - 具体的なアドバイスを提供");
        sb.AppendLine();

        // 成約結果に応じた学習ポイント
        if (!string.IsNullOrEmpty(session.OutcomeLabel))
        {
            sb.AppendLine("### 学習ポイント");
            sb.AppendLine();

            if (session.OutcomeLabel.ToLower() == "won")
            {
                sb.AppendLine("✅ **成約事例からの学び**");
                sb.AppendLine("- どのような対応が成約につながったか分析しましょう");
                sb.AppendLine("- 成功要因を他の商談にも応用できるか検討しましょう");
            }
            else if (session.OutcomeLabel.ToLower() == "lost")
            {
                sb.AppendLine("❌ **失注事例からの学び**");
                sb.AppendLine("- どの段階で顧客の関心が薄れたか確認しましょう");
                sb.AppendLine("- 改善点を次回の商談に活かしましょう");
            }
            sb.AppendLine();
        }

        sb.AppendLine("### 次のステップ");
        sb.AppendLine();
        sb.AppendLine("1. このトランスクリプトを読み込む");
        sb.AppendLine("2. Copilot Studio Liteで顧客役のエージェントを設定");
        sb.AppendLine("3. 実際のロールプレイを実施");
        sb.AppendLine("4. AIからのフィードバックを受け取る");
        sb.AppendLine("5. 改善点を次回の商談に反映");
        sb.AppendLine();

        sb.AppendLine("---");
        sb.AppendLine();
        sb.AppendLine($"*このドキュメントは自動生成されました - Session ID: {session.Id}*");
    }

    private static string GetSpeakerLabel(string speakerId)
    {
        // 話者IDから分かりやすいラベルを生成
        var speakerNumber = speakerId.Replace("spk-", "");
        return int.TryParse(speakerNumber, out var num)
            ? num == 0 ? "🧑‍💼 販売員" : "👤 顧客"
            : $"話者 {speakerId}";
    }

    private static string FormatTimeRange(double start, double end)
    {
        var startTime = TimeSpan.FromSeconds(start);
        var endTime = TimeSpan.FromSeconds(end);
        return $"{startTime:mm\\:ss} - {endTime:mm\\:ss}";
    }

    private static string GetSentimentEmoji(string sentiment)
    {
        return sentiment.ToLower() switch
        {
            "positive" => "😊",
            "neutral" => "😐",
            "negative" => "😟",
            _ => "❓"
        };
    }

    private static string GetSentimentLabel(string sentiment)
    {
        return sentiment.ToLower() switch
        {
            "positive" => "ポジティブ",
            "neutral" => "中立",
            "negative" => "ネガティブ",
            _ => sentiment
        };
    }
}
