using FluentValidation;

namespace FunctionsApp.Shared;

public class UploadAudioRequest
{
    public bool ConsentGiven { get; set; }
    public string CustomerName { get; set; } = default!;
}

public class UploadAudioRequestValidator : AbstractValidator<UploadAudioRequest>
{
    public UploadAudioRequestValidator()
    {
        RuleFor(x => x.ConsentGiven).Equal(true).WithMessage("Consent is required");
        RuleFor(x => x.CustomerName).NotEmpty().MaximumLength(200);
    }
}

public class CreateOutcomeLabelRequestCommand
{
    public string SessionId { get; set; } = default!;
    public string Outcome { get; set; } = default!;
    public string? Reason { get; set; }
}

public class CreateOutcomeLabelRequestValidator : AbstractValidator<CreateOutcomeLabelRequestCommand>
{
    public CreateOutcomeLabelRequestValidator()
    {
        RuleFor(x => x.SessionId).NotEmpty();
        RuleFor(x => x.Outcome).Must(x => new[] { "won", "lost", "pending", "canceled" }.Contains(x))
            .WithMessage("Invalid outcome value");
    }
}

public class ApproveOutcomeLabelRequestCommand
{
    public string RequestId { get; set; } = default!;
    public string? Reason { get; set; }
}

public class ApproveOutcomeLabelRequestValidator : AbstractValidator<ApproveOutcomeLabelRequestCommand>
{
    public ApproveOutcomeLabelRequestValidator()
    {
        RuleFor(x => x.RequestId).NotEmpty();
    }
}

public class RejectOutcomeLabelRequestCommand
{
    public string RequestId { get; set; } = default!;
    public string Reason { get; set; } = default!;
}

public class RejectOutcomeLabelRequestValidator : AbstractValidator<RejectOutcomeLabelRequestCommand>
{
    public RejectOutcomeLabelRequestValidator()
    {
        RuleFor(x => x.RequestId).NotEmpty();
        RuleFor(x => x.Reason).NotEmpty().WithMessage("Reason is required for rejection");
    }
}
