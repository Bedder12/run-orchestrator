namespace Buildy.Domain;

public sealed class Run
{
    private readonly List<ArtifactRef> _artifacts = new();
    private readonly List<StepDuration> _stepDurations = new();

    public RunId Id { get; private set; }
    public WorkflowState State { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    public int RetryCount { get; private set; }
    public DateTimeOffset? CurrentStepStartedAt { get; private set; }
    public string Prompt { get; private set; }
    public string? ProjectName { get; private set; }
    public IReadOnlyCollection<ArtifactRef> Artifacts => _artifacts;
    public IReadOnlyCollection<StepDuration> StepDurations => _stepDurations;
    public string? FailureReason { get; private set; }
    public string? ApprovalSummary { get; private set; }

    private Run()
    {
        Id = RunId.New();
        State = WorkflowState.Init;
        CreatedAt = DateTimeOffset.UtcNow;
        UpdatedAt = CreatedAt;
        Prompt = string.Empty;
    }

    public Run(RunId id, DateTimeOffset now, string prompt, string? projectName)
    {
        Id = id;
        State = WorkflowState.Init;
        CreatedAt = now;
        UpdatedAt = now;
        Prompt = prompt;
        ProjectName = projectName;
    }

    public Run(
        RunId id,
        string prompt,
        string? projectName,
        WorkflowState state,
        DateTimeOffset createdAt,
        DateTimeOffset updatedAt,
        int retryCount,
        DateTimeOffset? currentStepStartedAt,
        string? failureReason,
        string? approvalSummary)
    {
        Id = id;
        Prompt = prompt;
        ProjectName = projectName;
        State = state;
        CreatedAt = createdAt;
        UpdatedAt = updatedAt;
        RetryCount = retryCount;
        CurrentStepStartedAt = currentStepStartedAt;
        FailureReason = failureReason;
        ApprovalSummary = approvalSummary;
    }

    public static Run StartNew(DateTimeOffset now, string prompt, string? projectName) => new(RunId.New(), now, prompt, projectName);

    public void TransitionTo(WorkflowState nextState, DateTimeOffset now)
    {
        if (!IsValidTransition(State, nextState))
        {
            throw new DomainException($"Invalid transition from {State} to {nextState}.");
        }

        if (CurrentStepStartedAt.HasValue)
        {
            var duration = now - CurrentStepStartedAt.Value;
            _stepDurations.RemoveAll(sd => sd.Step == State);
            _stepDurations.Add(new StepDuration(State, duration));
        }

        State = nextState;
        UpdatedAt = now;
        CurrentStepStartedAt = null;
    }

    public void MarkStepStarted(DateTimeOffset now)
    {
        CurrentStepStartedAt = now;
        UpdatedAt = now;
    }

    public void RecordArtifact(string type, string path, DateTimeOffset now, WorkflowState step)
    {
        if (_artifacts.Any(a => a.Path.Equals(path, StringComparison.OrdinalIgnoreCase)))
        {
            return;
        }

        _artifacts.Add(new ArtifactRef(type, path, now, step));
        UpdatedAt = now;
    }

    public void LoadArtifact(ArtifactRef artifact)
    {
        if (_artifacts.Any(a => a.Path.Equals(artifact.Path, StringComparison.OrdinalIgnoreCase)))
        {
            return;
        }

        _artifacts.Add(artifact);
    }

    public void LoadStepDuration(StepDuration duration)
    {
        _stepDurations.RemoveAll(sd => sd.Step == duration.Step);
        _stepDurations.Add(duration);
    }

    public void IncrementRetry(DateTimeOffset now)
    {
        RetryCount++;
        UpdatedAt = now;
    }

    public void Fail(string reason, DateTimeOffset now)
    {
        FailureReason = reason;
        State = WorkflowState.Fail;
        UpdatedAt = now;
        CurrentStepStartedAt = null;
    }

    public void RequestApproval(string summary, DateTimeOffset now)
    {
        ApprovalSummary = summary;
        TransitionTo(WorkflowState.WaitingForApproval, now);
    }

    public void Approve(DateTimeOffset now)
    {
        if (State != WorkflowState.WaitingForApproval)
        {
            throw new DomainException("Run is not waiting for approval.");
        }

        ApprovalSummary = null;
        TransitionTo(WorkflowState.Deploy, now);
    }

    public void Reject(string reason, DateTimeOffset now)
    {
        FailureReason = reason;
        State = WorkflowState.Fail;
        UpdatedAt = now;
        CurrentStepStartedAt = null;
    }

    private static bool IsValidTransition(WorkflowState current, WorkflowState next)
    {
        return current switch
        {
            WorkflowState.Init => next == WorkflowState.Spec,
            WorkflowState.Spec => next == WorkflowState.Plan,
            WorkflowState.Plan => next == WorkflowState.AppCode,
            WorkflowState.AppCode => next == WorkflowState.Test,
            WorkflowState.Test => next == WorkflowState.Security,
            WorkflowState.Security => next == WorkflowState.Infra,
            WorkflowState.Infra => next == WorkflowState.WaitingForApproval,
            WorkflowState.WaitingForApproval => next == WorkflowState.Deploy,
            WorkflowState.Deploy => next == WorkflowState.Done,
            WorkflowState.Done => false,
            WorkflowState.Fail => false,
            _ => false
        };
    }
}
