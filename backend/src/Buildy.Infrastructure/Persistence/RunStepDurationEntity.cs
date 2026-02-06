using Buildy.Domain;

namespace Buildy.Infrastructure.Persistence;

public sealed class RunStepDurationEntity
{
    public int Id { get; set; }
    public Guid RunId { get; set; }
    public WorkflowState Step { get; set; }
    public double DurationSeconds { get; set; }
}
