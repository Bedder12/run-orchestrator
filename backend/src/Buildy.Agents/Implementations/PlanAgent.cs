using System.Text.Json;
using Buildy.Application.Abstractions;
using Buildy.Domain;

namespace Buildy.Agents.Implementations;

public sealed class PlanAgent : IPlanAgent
{
    public Task<string> GeneratePlanAsync(RunId runId, string prompt, CancellationToken cancellationToken)
    {
        var plan = new
        {
            runId = runId.Value,
            steps = new[]
            {
                "Define requirements",
                "Design architecture",
                "Implement core features",
                "Validate and harden",
                "Prepare deployment"
            },
            sourcePrompt = prompt.Length > 80 ? string.Concat(prompt.AsSpan(0, 80), "...") : prompt
        };

        var json = JsonSerializer.Serialize(plan, new JsonSerializerOptions { WriteIndented = true });
        return Task.FromResult(json);
    }
}
