using System.Threading.Channels;
using Buildy.Application.Abstractions;
using Buildy.Shared;
using Buildy.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Buildy.Infrastructure.Events;

public sealed class RunEventPublisher : IRunEventPublisher, IRunEventReader
{
    private readonly IDbContextFactory<BuildyDbContext> _dbContextFactory;
    private readonly Channel<RunEvent> _channel;

    public RunEventPublisher(IDbContextFactory<BuildyDbContext> dbContextFactory)
    {
        _dbContextFactory = dbContextFactory;
        _channel = Channel.CreateUnbounded<RunEvent>();
    }

    public async Task PublishAsync(RunEvent runEvent, CancellationToken cancellationToken)
    {
        await using var dbContext = await _dbContextFactory.CreateDbContextAsync(cancellationToken);
        dbContext.RunEvents.Add(new RunEventEntity
        {
            Id = runEvent.Id,
            RunId = runEvent.RunId,
            Timestamp = runEvent.Timestamp,
            Type = runEvent.Type,
            PayloadJson = runEvent.PayloadJson
        });
        await dbContext.SaveChangesAsync(cancellationToken);
        await _channel.Writer.WriteAsync(runEvent, cancellationToken);
    }

    public async IAsyncEnumerable<RunEvent> StreamAsync(Guid runId, [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken cancellationToken)
    {
        await using var dbContext = await _dbContextFactory.CreateDbContextAsync(cancellationToken);
        var history = await dbContext.RunEvents
            .AsNoTracking()
            .Where(e => e.RunId == runId)
            .OrderBy(e => e.Timestamp)
            .ToListAsync(cancellationToken);

        foreach (var evt in history)
        {
            yield return new RunEvent(evt.Id, evt.RunId, evt.Timestamp, evt.Type, evt.PayloadJson);
        }

        await foreach (var evt in _channel.Reader.ReadAllAsync(cancellationToken))
        {
            if (evt.RunId == runId)
            {
                yield return evt;
            }
        }
    }

    public async Task<IReadOnlyCollection<RunEvent>> GetLatestAsync(Guid runId, int take, CancellationToken cancellationToken)
    {
        await using var dbContext = await _dbContextFactory.CreateDbContextAsync(cancellationToken);
        var events = await dbContext.RunEvents
            .AsNoTracking()
            .Where(e => e.RunId == runId)
            .OrderByDescending(e => e.Timestamp)
            .Take(take)
            .ToListAsync(cancellationToken);

        return events
            .OrderBy(e => e.Timestamp)
            .Select(e => new RunEvent(e.Id, e.RunId, e.Timestamp, e.Type, e.PayloadJson))
            .ToList();
    }
}
