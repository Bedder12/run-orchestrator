using Buildy.Domain;

namespace Buildy.Infrastructure.Persistence;

public sealed class RunArtifactEntity
{
    public int Id { get; set; }
    public Guid RunId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public WorkflowState Step { get; set; }
}
