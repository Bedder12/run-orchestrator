using Buildy.Application.Abstractions;
using Buildy.Domain;

namespace Buildy.Infrastructure.Services;

public sealed class DeployService : IDeployService
{
    public Task<string> DeployAsync(RunId runId, CancellationToken cancellationToken)
    {
        var payload = "{\"status\":\"success\",\"message\":\"Deployment simulated\"}";
        return Task.FromResult(payload);
    }
}
