using Buildy.Domain;

namespace Buildy.Infrastructure.Persistence;

public sealed class RunEntity
{
    public Guid Id { get; set; }
    public string Prompt { get; set; } = string.Empty;
    public string? ProjectName { get; set; }
    public WorkflowState State { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public int RetryCount { get; set; }
    public DateTimeOffset? CurrentStepStartedAt { get; set; }
    public string? FailureReason { get; set; }
    public string? ApprovalSummary { get; set; }
    public List<RunArtifactEntity> Artifacts { get; set; } = new();
    public List<RunStepDurationEntity> StepDurations { get; set; } = new();
}
