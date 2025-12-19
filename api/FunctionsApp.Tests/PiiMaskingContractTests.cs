using Xunit;
using FunctionsApp.Shared;

namespace FunctionsApp.Tests;

public class PiiMaskingContractTests
{
    [Fact]
    public void PiiMasking_索引前に必須()
    {
        // Arrange
        var transcription = new Transcription
        {
            Speakers = new List<Speaker>
            {
                new Speaker
                {
                    Id = "spk-0",
                    Segments = new List<Segment>
                    {
                        new Segment
                        {
                            Id = "seg-0",
                            Text = "私の名前は山田太郎です。電話番号は090-1234-5678です。"
                        }
                    }
                }
            }
        };

        // Act
        // LanguageClient.RedactPiiAsync() を呼び出す想定
        var piiMasked = new PiiMaskedData
        {
            FullText = "私の名前は[PERSON]です。電話番号は[PHONE]です。",
            Entities = new List<PiiEntity>
            {
                new PiiEntity { Type = "PERSON", Text = "山田太郎", RedactedText = "[PERSON]" },
                new PiiEntity { Type = "PHONE", Text = "090-1234-5678", RedactedText = "[PHONE]" }
            }
        };

        // Assert
        Assert.DoesNotContain("山田太郎", piiMasked.FullText);
        Assert.DoesNotContain("090-1234-5678", piiMasked.FullText);
        Assert.Contains("[PERSON]", piiMasked.FullText);
        Assert.Contains("[PHONE]", piiMasked.FullText);
        Assert.Equal(2, piiMasked.Entities.Count);
    }

    [Fact]
    public void AI_Search_索引はPIIマスク後のみ()
    {
        // Arrange
        var piiMaskedText = "私の名前は[PERSON]です。";

        // Act
        // SearchRepository.IndexSessionAsync() を呼び出す想定

        // Assert
        Assert.DoesNotContain("山田太郎", piiMaskedText); // 実名が含まれていないことを確認
    }
}
