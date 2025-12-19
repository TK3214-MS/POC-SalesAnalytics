using System.Text.Json.Serialization;

namespace FunctionsApp.Shared;

public class Session
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = default!;

    [JsonPropertyName("userId")]
    public string UserId { get; set; } = default!;

    [JsonPropertyName("storeId")]
    public string StoreId { get; set; } = default!;

    [JsonPropertyName("customerName")]
    public string CustomerName { get; set; } = default!;

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("consentGiven")]
    public bool ConsentGiven { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = "pending"; // pending, processing, completed, failed

    [JsonPropertyName("audioUrl")]
    public string? AudioUrl { get; set; }

    [JsonPropertyName("transcription")]
    public Transcription? Transcription { get; set; }

    [JsonPropertyName("piiMasked")]
    public PiiMaskedData? PiiMasked { get; set; }

    [JsonPropertyName("sentiment")]
    public SentimentData? Sentiment { get; set; }

    [JsonPropertyName("summary")]
    public Summary? Summary { get; set; }

    [JsonPropertyName("outcomeLabel")]
    public string? OutcomeLabel { get; set; } // won, lost, pending, canceled

    [JsonPropertyName("outcomeLabelRequest")]
    public OutcomeLabelRequest? OutcomeLabelRequest { get; set; }

    [JsonPropertyName("ttl")]
    public int Ttl { get; set; } = 2592000; // 30 days
}

public class Transcription
{
    [JsonPropertyName("speakers")]
    public List<Speaker> Speakers { get; set; } = new();
}

public class Speaker
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = default!;

    [JsonPropertyName("segments")]
    public List<Segment> Segments { get; set; } = new();
}

public class Segment
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = default!;

    [JsonPropertyName("text")]
    public string Text { get; set; } = default!;

    [JsonPropertyName("start")]
    public double Start { get; set; }

    [JsonPropertyName("end")]
    public double End { get; set; }
}

public class PiiMaskedData
{
    [JsonPropertyName("fullText")]
    public string FullText { get; set; } = default!;

    [JsonPropertyName("entities")]
    public List<PiiEntity> Entities { get; set; } = new();
}

public class PiiEntity
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = default!;

    [JsonPropertyName("text")]
    public string Text { get; set; } = default!;

    [JsonPropertyName("redactedText")]
    public string RedactedText { get; set; } = default!;
}

public class SentimentData
{
    [JsonPropertyName("overall")]
    public string Overall { get; set; } = default!; // positive, neutral, negative

    [JsonPropertyName("segments")]
    public List<SentimentSegment> Segments { get; set; } = new();
}

public class SentimentSegment
{
    [JsonPropertyName("text")]
    public string Text { get; set; } = default!;

    [JsonPropertyName("sentiment")]
    public string Sentiment { get; set; } = default!;

    [JsonPropertyName("confidence")]
    public double Confidence { get; set; }
}

public class Summary
{
    [JsonPropertyName("keyPoints")]
    public List<string> KeyPoints { get; set; } = new();

    [JsonPropertyName("concerns")]
    public List<string> Concerns { get; set; } = new();

    [JsonPropertyName("nextActions")]
    public List<string> NextActions { get; set; } = new();

    [JsonPropertyName("successFactors")]
    public List<string> SuccessFactors { get; set; } = new();

    [JsonPropertyName("improvementAreas")]
    public List<string> ImprovementAreas { get; set; } = new();

    [JsonPropertyName("quotations")]
    public List<Quotation> Quotations { get; set; } = new();
}

public class Quotation
{
    [JsonPropertyName("speakerSegmentId")]
    public string SpeakerSegmentId { get; set; } = default!;

    [JsonPropertyName("timeRange")]
    public string TimeRange { get; set; } = default!;

    [JsonPropertyName("text")]
    public string Text { get; set; } = default!;
}

public class OutcomeLabelRequest
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = default!;

    [JsonPropertyName("requestedBy")]
    public string RequestedBy { get; set; } = default!;

    [JsonPropertyName("requestedAt")]
    public DateTime RequestedAt { get; set; }

    [JsonPropertyName("outcome")]
    public string Outcome { get; set; } = default!;

    [JsonPropertyName("reason")]
    public string? Reason { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = "pending"; // pending, approved, rejected
}

public class LabelAudit
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = default!;

    [JsonPropertyName("sessionId")]
    public string SessionId { get; set; } = default!;

    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; }

    [JsonPropertyName("action")]
    public string Action { get; set; } = default!; // REQUEST_CREATED, APPROVED, REJECTED, OVERRIDE

    [JsonPropertyName("actorUserId")]
    public string ActorUserId { get; set; } = default!;

    [JsonPropertyName("actorRole")]
    public string ActorRole { get; set; } = default!;

    [JsonPropertyName("outcome")]
    public string? Outcome { get; set; }

    [JsonPropertyName("reason")]
    public string? Reason { get; set; }

    [JsonPropertyName("metadata")]
    public Dictionary<string, object> Metadata { get; set; } = new();
}

public class UserClaims
{
    public string UserId { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Role { get; set; } = default!; // Sales, Manager, Auditor
    public string StoreId { get; set; } = default!;
}
