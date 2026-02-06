using Buildy.Domain;

namespace Buildy.Application.Abstractions;

public interface ITestValidator
{
    Task<string> ValidateAsync(RunId runId, CancellationToken cancellationToken);
}

public interface ISecurityValidator
{
    Task<string> ValidateAsync(RunId runId, CancellationToken cancellationToken);
}

public interface IDeployService
{
    Task<string> DeployAsync(RunId runId, CancellationToken cancellationToken);
}
