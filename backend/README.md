# Buildy Orchestrator Backend

## Solution Structure

```
backend/
  Buildy.sln
  src/
    Buildy.Api/
    Buildy.Application/
    Buildy.Domain/
    Buildy.Infrastructure/
    Buildy.Agents/
    Buildy.Validation/
    Buildy.Shared/
  tests/
    Buildy.Tests/
```

## Local Development

```bash
cd backend
# restore/build
# dotnet restore
# dotnet build
```

### Database & Migrations

SQLite is configured via `Data Source=buildy.db` in the API.

Create migrations (from the backend directory):

```bash
# dotnet tool install --global dotnet-ef
# dotnet ef migrations add InitialCreate --project src/Buildy.Infrastructure --startup-project src/Buildy.Api
# dotnet ef database update --project src/Buildy.Infrastructure --startup-project src/Buildy.Api
```

## API Usage

### Create a run

```bash
curl -X POST http://localhost:5000/runs \
  -H "Content-Type: application/json" \
  -d '{"projectName":"demo","prompt":"Build an AI delivery platform"}'
```

### Advance run until waiting for approval

```bash
curl -X POST http://localhost:5000/runs/{runId}/advance
```

Repeat the `advance` call until the run reaches `WaitingForApproval`.

### Approve a run

```bash
curl -X POST http://localhost:5000/runs/{runId}/approve
```

### Advance to done

```bash
curl -X POST http://localhost:5000/runs/{runId}/advance
```

### Stream events (SSE)

```bash
curl http://localhost:5000/runs/{runId}/events
```

## Artifacts

Artifacts are written under:

```
backend/src/Buildy.Api/bin/Debug/net8.0/workspaces/{runId}/
```

This location is derived from the API base directory.
