using Buildy.Application.Abstractions;
using Buildy.Domain;

namespace Buildy.Agents.Implementations;

public sealed class AppCodeAgent : IAppCodeAgent
{
    public Task<string> GenerateAppCodeAsync(RunId runId, string prompt, CancellationToken cancellationToken)
    {
        var content = $"""
# Application Scaffold

Run: {runId}

This folder is a placeholder for generated application code.

Prompt excerpt:
{(prompt.Length > 200 ? string.Concat(prompt.AsSpan(0, 200), "...") : prompt)}
""";

        return Task.FromResult(content.Trim());
    }
}
