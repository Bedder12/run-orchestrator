using Buildy.Shared;

namespace Buildy.Application.Abstractions;

public interface IRunEventPublisher
{
    Task PublishAsync(RunEvent runEvent, CancellationToken cancellationToken);
    IAsyncEnumerable<RunEvent> StreamAsync(Guid runId, CancellationToken cancellationToken);
}

public interface IRunEventReader
{
    Task<IReadOnlyCollection<RunEvent>> GetLatestAsync(Guid runId, int take, CancellationToken cancellationToken);
}
