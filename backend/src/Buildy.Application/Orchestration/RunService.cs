using Buildy.Application.Abstractions;
using Buildy.Application.Commands;
using Buildy.Application.Models;
using Buildy.Domain;
using Buildy.Shared;

namespace Buildy.Application.Orchestration;

public sealed class RunService
{
    private readonly IRunRepository _runs;
    private readonly RunOrchestrator _orchestrator;
    private readonly IRunEventPublisher _events;

    public RunService(IRunRepository runs, RunOrchestrator orchestrator, IRunEventPublisher events)
    {
        _runs = runs;
        _orchestrator = orchestrator;
        _events = events;
    }

    public async Task<RunDetails> StartAsync(StartRunCommand command, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var run = Run.StartNew(now, command.Prompt, command.ProjectName);
        await _runs.AddAsync(run, cancellationToken);
        await _events.PublishAsync(new RunEvent(Guid.NewGuid(), run.Id.Value, now, RunEventType.StateChanged, "{\"state\":\"Init\"}"), cancellationToken);
        return ToDetails(run);
    }

    public async Task<RunDetails> AdvanceAsync(AdvanceRunCommand command, CancellationToken cancellationToken)
    {
        var run = await _orchestrator.AdvanceAsync(command.RunId, cancellationToken);
        return ToDetails(run);
    }

    public async Task<RunDetails> ApproveAsync(ApproveRunCommand command, CancellationToken cancellationToken)
    {
        var run = await _runs.GetByIdAsync(command.RunId, cancellationToken) ?? throw new DomainException("Run not found.");
        run.Approve(DateTimeOffset.UtcNow);
        await _runs.UpdateAsync(run, cancellationToken);
        await _events.PublishAsync(new RunEvent(Guid.NewGuid(), run.Id.Value, DateTimeOffset.UtcNow, RunEventType.StateChanged, "{\"state\":\"Deploy\"}"), cancellationToken);
        return ToDetails(run);
    }

    public async Task<RunDetails> RejectAsync(RejectRunCommand command, CancellationToken cancellationToken)
    {
        var run = await _runs.GetByIdAsync(command.RunId, cancellationToken) ?? throw new DomainException("Run not found.");
        run.Reject(command.Reason, DateTimeOffset.UtcNow);
        await _runs.UpdateAsync(run, cancellationToken);
        await _events.PublishAsync(new RunEvent(Guid.NewGuid(), run.Id.Value, DateTimeOffset.UtcNow, RunEventType.RunFailed, "{\"state\":\"Fail\"}"), cancellationToken);
        return ToDetails(run);
    }

    public async Task<RunDetails> DeployAsync(DeployRunCommand command, CancellationToken cancellationToken)
    {
        var run = await _orchestrator.AdvanceAsync(command.RunId, cancellationToken);
        return ToDetails(run);
    }

    public async Task<RunDetails> GetAsync(RunId id, CancellationToken cancellationToken)
    {
        var run = await _runs.GetByIdAsync(id, cancellationToken) ?? throw new DomainException("Run not found.");
        return ToDetails(run);
    }

    private static RunDetails ToDetails(Run run) => new(
        run.Id,
        run.State,
        run.Prompt,
        run.ProjectName,
        run.CreatedAt,
        run.UpdatedAt,
        run.RetryCount,
        run.CurrentStepStartedAt,
        run.FailureReason,
        run.ApprovalSummary,
        run.Artifacts.ToList(),
        run.StepDurations.ToList());
}
