using Buildy.Domain;

namespace Buildy.Application.Abstractions;

public interface IRunRepository
{
    Task<Run?> GetByIdAsync(RunId id, CancellationToken cancellationToken);
    Task AddAsync(Run run, CancellationToken cancellationToken);
    Task UpdateAsync(Run run, CancellationToken cancellationToken);
}
