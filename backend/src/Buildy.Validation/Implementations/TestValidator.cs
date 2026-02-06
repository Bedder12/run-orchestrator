using System.Text.Json;
using Buildy.Application.Abstractions;
using Buildy.Domain;

namespace Buildy.Validation.Implementations;

public sealed class TestValidator : ITestValidator
{
    public Task<string> ValidateAsync(RunId runId, CancellationToken cancellationToken)
    {
        var report = new
        {
            runId = runId.Value,
            status = "pass",
            executedAt = DateTimeOffset.UtcNow,
            notes = "TODO: integrate real test runner."
        };

        return Task.FromResult(JsonSerializer.Serialize(report, new JsonSerializerOptions { WriteIndented = true }));
    }
}
