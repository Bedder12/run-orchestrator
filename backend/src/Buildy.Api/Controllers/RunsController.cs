using System.Text.Json;
using Buildy.Api.Models;
using Buildy.Application.Abstractions;
using Buildy.Application.Commands;
using Buildy.Application.Orchestration;
using Buildy.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Buildy.Api.Controllers;

[ApiController]
[Route("runs")]
public sealed class RunsController : ControllerBase
{
    private readonly RunService _runService;
    private readonly IRunEventReader _eventReader;
    private readonly IRunEventPublisher _eventPublisher;

    public RunsController(RunService runService, IRunEventReader eventReader, IRunEventPublisher eventPublisher)
    {
        _runService = runService;
        _eventReader = eventReader;
        _eventPublisher = eventPublisher;
    }

    [HttpPost]
    public async Task<IActionResult> StartRun([FromBody] StartRunRequest request, CancellationToken cancellationToken)
    {
        var result = await _runService.StartAsync(new StartRunCommand(request.Prompt, request.ProjectName), cancellationToken);
        return Ok(new { runId = result.Id.Value, state = result.State });
    }

    [HttpPost("{id:guid}/advance")]
    public async Task<IActionResult> AdvanceRun(Guid id, CancellationToken cancellationToken)
    {
        var result = await _runService.AdvanceAsync(new AdvanceRunCommand(new RunId(id)), cancellationToken);
        return Ok(new { runId = result.Id.Value, state = result.State });
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id, CancellationToken cancellationToken)
    {
        var result = await _runService.ApproveAsync(new ApproveRunCommand(new RunId(id)), cancellationToken);
        return Ok(new { runId = result.Id.Value, state = result.State });
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectRunRequest request, CancellationToken cancellationToken)
    {
        var result = await _runService.RejectAsync(new RejectRunCommand(new RunId(id), request.Reason), cancellationToken);
        return Ok(new { runId = result.Id.Value, state = result.State });
    }

    [HttpPost("{id:guid}/deploy")]
    public async Task<IActionResult> Deploy(Guid id, CancellationToken cancellationToken)
    {
        var result = await _runService.DeployAsync(new DeployRunCommand(new RunId(id)), cancellationToken);
        return Ok(new { runId = result.Id.Value, state = result.State });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetRun(Guid id, CancellationToken cancellationToken)
    {
        var result = await _runService.GetAsync(new RunId(id), cancellationToken);
        var events = await _eventReader.GetLatestAsync(id, 10, cancellationToken);

        return Ok(new
        {
            runId = result.Id.Value,
            state = result.State,
            prompt = result.Prompt,
            projectName = result.ProjectName,
            createdAt = result.CreatedAt,
            updatedAt = result.UpdatedAt,
            retryCount = result.RetryCount,
            currentStepStartedAt = result.CurrentStepStartedAt,
            failureReason = result.FailureReason,
            approvalSummary = result.ApprovalSummary,
            artifacts = result.Artifacts,
            stepDurations = result.StepDurations,
            recentEvents = events
        });
    }

    [HttpGet("{id:guid}/events")]
    public async Task GetEvents(Guid id, CancellationToken cancellationToken)
    {
        Response.Headers.ContentType = "text/event-stream";
        await foreach (var evt in _eventPublisher.StreamAsync(id, cancellationToken))
        {
            var payload = JsonSerializer.Serialize(evt);
            await Response.WriteAsync($"data: {payload}\n\n", cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);
        }
    }
}
