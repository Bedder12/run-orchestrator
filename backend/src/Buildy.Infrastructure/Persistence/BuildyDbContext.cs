using Microsoft.EntityFrameworkCore;

namespace Buildy.Infrastructure.Persistence;

public sealed class BuildyDbContext : DbContext
{
    public BuildyDbContext(DbContextOptions<BuildyDbContext> options) : base(options)
    {
    }

    public DbSet<RunEntity> Runs => Set<RunEntity>();
    public DbSet<RunArtifactEntity> RunArtifacts => Set<RunArtifactEntity>();
    public DbSet<RunStepDurationEntity> RunStepDurations => Set<RunStepDurationEntity>();
    public DbSet<RunEventEntity> RunEvents => Set<RunEventEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RunEntity>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.State).HasConversion<string>();
            entity.Property(r => r.Prompt).IsRequired();
            entity.HasMany(r => r.Artifacts)
                .WithOne()
                .HasForeignKey(a => a.RunId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(r => r.StepDurations)
                .WithOne()
                .HasForeignKey(d => d.RunId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RunArtifactEntity>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Step).HasConversion<string>();
        });

        modelBuilder.Entity<RunStepDurationEntity>(entity =>
        {
            entity.HasKey(d => d.Id);
            entity.Property(d => d.Step).HasConversion<string>();
        });

        modelBuilder.Entity<RunEventEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type).HasConversion<string>();
            entity.HasIndex(e => e.RunId);
        });
    }
}
