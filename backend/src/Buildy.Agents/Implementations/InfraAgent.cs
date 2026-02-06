using Buildy.Application.Abstractions;
using Buildy.Domain;

namespace Buildy.Agents.Implementations;

public sealed class InfraAgent : IInfraAgent
{
    public Task<string> GenerateInfraAsync(RunId runId, string prompt, CancellationToken cancellationToken)
    {
        var content = $"""
# Infrastructure Scaffold

Run: {runId}

Placeholder infra artifacts to be expanded:
- Dockerfile
- docker-compose.yml
- terraform/main.tf
- .github/workflows/deploy.yml

Prompt excerpt:
{(prompt.Length > 200 ? string.Concat(prompt.AsSpan(0, 200), "...") : prompt)}
""";

        return Task.FromResult(content.Trim());
    }
}
