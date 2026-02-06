using Buildy.Domain;
using Xunit;

namespace Buildy.Tests;

public sealed class RunTests
{
    [Fact]
    public void TransitionEnforcesOrder()
    {
        var run = Run.StartNew(DateTimeOffset.UtcNow, "prompt", "project");
        run.TransitionTo(WorkflowState.Spec, DateTimeOffset.UtcNow);
        Assert.Equal(WorkflowState.Spec, run.State);
        Assert.Throws<DomainException>(() => run.TransitionTo(WorkflowState.Deploy, DateTimeOffset.UtcNow));
    }
}
