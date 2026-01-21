using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using FunctionsApp.AI;

namespace FunctionsApp.Activities;

public class RunPiiRedactionActivity
{
    private readonly ILanguageClient _languageClient;

    public RunPiiRedactionActivity(ILanguageClient languageClient)
    {
        _languageClient = languageClient;
    }

    [Function(nameof(RunPiiRedactionActivity))]
    public async Task<Shared.PiiMaskedData> Run(
        [ActivityTrigger] Shared.Transcription transcription,
        FunctionContext context)
    {
        var logger = context.GetLogger(nameof(RunPiiRedactionActivity));
        logger.LogInformation("Running PII redaction");

        // 全話者の全セグメントを結合
        var fullText = string.Join("\n", transcription.Speakers
            .SelectMany(s => s.Segments)
            .Select(seg => seg.Text));

        var piiMasked = await _languageClient.RedactPiiAsync(fullText);

        logger.LogInformation($"PII redaction completed, found {piiMasked.Entities.Count} entities");
        return piiMasked;
    }
}
