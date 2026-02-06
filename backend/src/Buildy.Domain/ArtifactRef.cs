namespace Buildy.Domain;

public sealed record ArtifactRef(
    string Type,
    string Path,
    DateTimeOffset CreatedAt,
    WorkflowState Step);
