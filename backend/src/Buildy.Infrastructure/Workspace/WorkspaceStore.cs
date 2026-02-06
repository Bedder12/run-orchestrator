using System.Text.Json;
using Buildy.Application.Abstractions;
using Buildy.Domain;

namespace Buildy.Infrastructure.Workspace;

public sealed class WorkspaceStore : IWorkspaceStore
{
    private readonly string _rootPath;

    public WorkspaceStore(string rootPath)
    {
        _rootPath = Path.GetFullPath(rootPath);
        Directory.CreateDirectory(_rootPath);
    }

    public async Task<string> WriteTextAsync(RunId runId, string relativePath, string contents, CancellationToken cancellationToken)
    {
        var path = GetSafePath(runId, relativePath);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        await File.WriteAllTextAsync(path, contents, cancellationToken);
        return path;
    }

    public async Task<string> WriteJsonAsync<T>(RunId runId, string relativePath, T payload, CancellationToken cancellationToken)
    {
        var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true });
        return await WriteTextAsync(runId, relativePath, json, cancellationToken);
    }

    public Task<bool> ArtifactExistsAsync(RunId runId, string relativePath, CancellationToken cancellationToken)
    {
        var path = GetSafePath(runId, relativePath);
        return Task.FromResult(File.Exists(path));
    }

    public string GetWorkspacePath(RunId runId)
    {
        return GetSafePath(runId, string.Empty);
    }

    private string GetSafePath(RunId runId, string relativePath)
    {
        var safeRunId = runId.Value.ToString("N");
        var combined = Path.Combine(_rootPath, safeRunId, relativePath);
        var fullPath = Path.GetFullPath(combined);
        if (!fullPath.StartsWith(Path.Combine(_rootPath, safeRunId), StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Unsafe workspace path.");
        }

        return fullPath;
    }
}
