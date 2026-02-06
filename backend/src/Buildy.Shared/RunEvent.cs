namespace Buildy.Shared;

public enum RunEventType
{
    StateChanged,
    StepStarted,
    StepCompleted,
    ArtifactWritten,
    ValidationFailed,
    RunFailed,
    RunCompleted
}

public sealed record RunEvent(
    Guid Id,
    Guid RunId,
    DateTimeOffset Timestamp,
    RunEventType Type,
    string PayloadJson);
