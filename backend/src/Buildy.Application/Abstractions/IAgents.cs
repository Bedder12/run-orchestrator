using Buildy.Domain;

namespace Buildy.Application.Abstractions;

public interface ISpecAgent
{
    Task<string> GenerateSpecAsync(RunId runId, string prompt, CancellationToken cancellationToken);
}

public interface IPlanAgent
{
    Task<string> GeneratePlanAsync(RunId runId, string prompt, CancellationToken cancellationToken);
}

public interface IAppCodeAgent
{
    Task<string> GenerateAppCodeAsync(RunId runId, string prompt, CancellationToken cancellationToken);
}

public interface IInfraAgent
{
    Task<string> GenerateInfraAsync(RunId runId, string prompt, CancellationToken cancellationToken);
}
