using Buildy.Domain;

namespace Buildy.Application.Models;

public sealed record RunDetails(
    RunId Id,
    WorkflowState State,
    string Prompt,
    string? ProjectName,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    int RetryCount,
    DateTimeOffset? CurrentStepStartedAt,
    string? FailureReason,
    string? ApprovalSummary,
    IReadOnlyCollection<ArtifactRef> Artifacts,
    IReadOnlyCollection<StepDuration> StepDurations);
