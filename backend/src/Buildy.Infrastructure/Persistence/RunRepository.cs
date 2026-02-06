using Buildy.Application.Abstractions;
using Buildy.Domain;
using Microsoft.EntityFrameworkCore;

namespace Buildy.Infrastructure.Persistence;

public sealed class RunRepository : IRunRepository
{
    private readonly BuildyDbContext _dbContext;

    public RunRepository(BuildyDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Run?> GetByIdAsync(RunId id, CancellationToken cancellationToken)
    {
        var entity = await _dbContext.Runs
            .Include(r => r.Artifacts)
            .Include(r => r.StepDurations)
            .FirstOrDefaultAsync(r => r.Id == id.Value, cancellationToken);

        return entity == null ? null : MapToDomain(entity);
    }

    public async Task AddAsync(Run run, CancellationToken cancellationToken)
    {
        var entity = MapToEntity(run);
        _dbContext.Runs.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Run run, CancellationToken cancellationToken)
    {
        var existing = await _dbContext.Runs
            .Include(r => r.Artifacts)
            .Include(r => r.StepDurations)
            .FirstOrDefaultAsync(r => r.Id == run.Id.Value, cancellationToken);

        if (existing == null)
        {
            throw new DomainException("Run not found.");
        }

        existing.State = run.State;
        existing.UpdatedAt = run.UpdatedAt;
        existing.CurrentStepStartedAt = run.CurrentStepStartedAt;
        existing.RetryCount = run.RetryCount;
        existing.FailureReason = run.FailureReason;
        existing.ApprovalSummary = run.ApprovalSummary;
        existing.ProjectName = run.ProjectName;
        existing.Prompt = run.Prompt;

        existing.Artifacts.Clear();
        existing.Artifacts.AddRange(run.Artifacts.Select(a => new RunArtifactEntity
        {
            RunId = run.Id.Value,
            Type = a.Type,
            Path = a.Path,
            CreatedAt = a.CreatedAt,
            Step = a.Step
        }));

        existing.StepDurations.Clear();
        existing.StepDurations.AddRange(run.StepDurations.Select(d => new RunStepDurationEntity
        {
            RunId = run.Id.Value,
            Step = d.Step,
            DurationSeconds = d.Duration.TotalSeconds
        }));

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static Run MapToDomain(RunEntity entity)
    {
        var run = new Run(
            new RunId(entity.Id),
            entity.Prompt,
            entity.ProjectName,
            entity.State,
            entity.CreatedAt,
            entity.UpdatedAt,
            entity.RetryCount,
            entity.CurrentStepStartedAt,
            entity.FailureReason,
            entity.ApprovalSummary);

        foreach (var artifact in entity.Artifacts)
        {
            run.LoadArtifact(new ArtifactRef(artifact.Type, artifact.Path, artifact.CreatedAt, artifact.Step));
        }

        foreach (var duration in entity.StepDurations)
        {
            run.LoadStepDuration(new StepDuration(duration.Step, TimeSpan.FromSeconds(duration.DurationSeconds)));
        }

        return run;
    }

    private static RunEntity MapToEntity(Run run)
    {
        return new RunEntity
        {
            Id = run.Id.Value,
            Prompt = run.Prompt,
            ProjectName = run.ProjectName,
            State = run.State,
            CreatedAt = run.CreatedAt,
            UpdatedAt = run.UpdatedAt,
            RetryCount = run.RetryCount,
            CurrentStepStartedAt = run.CurrentStepStartedAt,
            FailureReason = run.FailureReason,
            ApprovalSummary = run.ApprovalSummary,
            Artifacts = run.Artifacts.Select(a => new RunArtifactEntity
            {
                RunId = run.Id.Value,
                Type = a.Type,
                Path = a.Path,
                CreatedAt = a.CreatedAt,
                Step = a.Step
            }).ToList(),
            StepDurations = run.StepDurations.Select(d => new RunStepDurationEntity
            {
                RunId = run.Id.Value,
                Step = d.Step,
                DurationSeconds = d.Duration.TotalSeconds
            }).ToList()
        };
    }
}
