using System.Text.Json;
using Buildy.Application.Abstractions;
using Buildy.Domain;
using Buildy.Shared;

namespace Buildy.Application.Orchestration;

public sealed class RunOrchestrator
{
    private readonly IRunRepository _runs;
    private readonly IWorkspaceStore _workspace;
    private readonly IRunEventPublisher _events;
    private readonly ISpecAgent _specAgent;
    private readonly IPlanAgent _planAgent;
    private readonly IAppCodeAgent _appCodeAgent;
    private readonly ITestValidator _testValidator;
    private readonly ISecurityValidator _securityValidator;
    private readonly IInfraAgent _infraAgent;
    private readonly IDeployService _deployService;

    public RunOrchestrator(
        IRunRepository runs,
        IWorkspaceStore workspace,
        IRunEventPublisher events,
        ISpecAgent specAgent,
        IPlanAgent planAgent,
        IAppCodeAgent appCodeAgent,
        ITestValidator testValidator,
        ISecurityValidator securityValidator,
        IInfraAgent infraAgent,
        IDeployService deployService)
    {
        _runs = runs;
        _workspace = workspace;
        _events = events;
        _specAgent = specAgent;
        _planAgent = planAgent;
        _appCodeAgent = appCodeAgent;
        _testValidator = testValidator;
        _securityValidator = securityValidator;
        _infraAgent = infraAgent;
        _deployService = deployService;
    }

    public async Task<Run> AdvanceAsync(RunId runId, CancellationToken cancellationToken)
    {
        var run = await _runs.GetByIdAsync(runId, cancellationToken)
            ?? throw new DomainException("Run not found.");

        if (run.State == WorkflowState.WaitingForApproval || run.State == WorkflowState.Done || run.State == WorkflowState.Fail)
        {
            return run;
        }

        var now = DateTimeOffset.UtcNow;
        run.MarkStepStarted(now);
        await PublishAsync(run, RunEventType.StepStarted, new { run.State }, cancellationToken);

        switch (run.State)
        {
            case WorkflowState.Spec:
                await HandleStepAsync(run, "spec.json", () => _specAgent.GenerateSpecAsync(run.Id, run.Prompt, cancellationToken), cancellationToken);
                run.TransitionTo(WorkflowState.Plan, DateTimeOffset.UtcNow);
                await PublishAsync(run, RunEventType.StateChanged, new { run.State }, cancellationToken);
                break;
            case WorkflowState.Plan:
                await HandleStepAsync(run, "plan.json", () => _planAgent.GeneratePlanAsync(run.Id, run.Prompt, cancellationToken), cancellationToken);
                run.TransitionTo(WorkflowState.AppCode, DateTimeOffset.UtcNow);
                await PublishAsync(run, RunEventType.StateChanged, new { run.State }, cancellationToken);
                break;
            case WorkflowState.AppCode:
                await HandleStepAsync(run, "app/README.md", () => _appCodeAgent.GenerateAppCodeAsync(run.Id, run.Prompt, cancellationToken), cancellationToken);
                run.TransitionTo(WorkflowState.Test, DateTimeOffset.UtcNow);
                await PublishAsync(run, RunEventType.StateChanged, new { run.State }, cancellationToken);
                break;
            case WorkflowState.Test:
                await HandleStepAsync(run, "test-report.json", () => _testValidator.ValidateAsync(run.Id, cancellationToken), cancellationToken);
                run.TransitionTo(WorkflowState.Security, DateTimeOffset.UtcNow);
                await PublishAsync(run, RunEventType.StateChanged, new { run.State }, cancellationToken);
                break;
            case WorkflowState.Security:
                await HandleStepAsync(run, "security-report.json", () => _securityValidator.ValidateAsync(run.Id, cancellationToken), cancellationToken);
                run.TransitionTo(WorkflowState.Infra, DateTimeOffset.UtcNow);
                await PublishAsync(run, RunEventType.StateChanged, new { run.State }, cancellationToken);
                break;
            case WorkflowState.Infra:
                await HandleStepAsync(run, "infra/README.md", () => _infraAgent.GenerateInfraAsync(run.Id, run.Prompt, cancellationToken), cancellationToken);
                run.RequestApproval("Infra artifacts ready for deploy.", DateTimeOffset.UtcNow);
                await PublishAsync(run, RunEventType.StateChanged, new { run.State }, cancellationToken);
                break;
            case WorkflowState.Deploy:
                await HandleStepAsync(run, "deploy-report.json", () => _deployService.DeployAsync(run.Id, cancellationToken), cancellationToken);
                run.TransitionTo(WorkflowState.Done, DateTimeOffset.UtcNow);
                await PublishAsync(run, RunEventType.RunCompleted, new { run.State }, cancellationToken);
                break;
            case WorkflowState.Init:
                run.TransitionTo(WorkflowState.Spec, DateTimeOffset.UtcNow);
                await PublishAsync(run, RunEventType.StateChanged, new { run.State }, cancellationToken);
                break;
            default:
                throw new DomainException($"Cannot advance from {run.State}.");
        }

        await _runs.UpdateAsync(run, cancellationToken);
        return run;
    }

    private async Task HandleStepAsync(Run run, string relativePath, Func<Task<string>> writer, CancellationToken cancellationToken)
    {
        if (!await _workspace.ArtifactExistsAsync(run.Id, relativePath, cancellationToken))
        {
            var contents = await writer();
            var writtenPath = await _workspace.WriteTextAsync(run.Id, relativePath, contents, cancellationToken);
            run.RecordArtifact(Path.GetFileName(relativePath), writtenPath, DateTimeOffset.UtcNow, run.State);
            await PublishAsync(run, RunEventType.ArtifactWritten, new { path = writtenPath, step = run.State }, cancellationToken);
        }

        await PublishAsync(run, RunEventType.StepCompleted, new { run.State }, cancellationToken);
    }

    private Task PublishAsync(Run run, RunEventType type, object payload, CancellationToken cancellationToken)
    {
        var json = JsonSerializer.Serialize(payload);
        var runEvent = new RunEvent(Guid.NewGuid(), run.Id.Value, DateTimeOffset.UtcNow, type, json);
        return _events.PublishAsync(runEvent, cancellationToken);
    }
}
