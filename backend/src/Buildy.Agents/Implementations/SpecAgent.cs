using System.Text.Json;
using Buildy.Application.Abstractions;
using Buildy.Domain;

namespace Buildy.Agents.Implementations;

public sealed class SpecAgent : ISpecAgent
{
    public Task<string> GenerateSpecAsync(RunId runId, string prompt, CancellationToken cancellationToken)
    {
        var spec = new
        {
            runId = runId.Value,
            summary = prompt.Length > 120 ? string.Concat(prompt.AsSpan(0, 120), "...") : prompt,
            requestedAt = DateTimeOffset.UtcNow
        };

        var json = JsonSerializer.Serialize(spec, new JsonSerializerOptions { WriteIndented = true });
        return Task.FromResult(json);
    }
}
