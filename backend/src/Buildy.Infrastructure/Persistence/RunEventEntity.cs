using Buildy.Shared;

namespace Buildy.Infrastructure.Persistence;

public sealed class RunEventEntity
{
    public Guid Id { get; set; }
    public Guid RunId { get; set; }
    public DateTimeOffset Timestamp { get; set; }
    public RunEventType Type { get; set; }
    public string PayloadJson { get; set; } = string.Empty;
}
