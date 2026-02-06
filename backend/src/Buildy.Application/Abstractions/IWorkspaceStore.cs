using Buildy.Domain;

namespace Buildy.Application.Abstractions;

public interface IWorkspaceStore
{
    Task<string> WriteTextAsync(RunId runId, string relativePath, string contents, CancellationToken cancellationToken);
    Task<string> WriteJsonAsync<T>(RunId runId, string relativePath, T payload, CancellationToken cancellationToken);
    Task<bool> ArtifactExistsAsync(RunId runId, string relativePath, CancellationToken cancellationToken);
    string GetWorkspacePath(RunId runId);
}
