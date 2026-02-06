namespace Buildy.Domain;

public sealed record StepDuration(
    WorkflowState Step,
    TimeSpan Duration);
