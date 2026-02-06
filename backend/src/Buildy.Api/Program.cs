using System.Threading.RateLimiting;
using Buildy.Agents.Implementations;
using Buildy.Application.Abstractions;
using Buildy.Application.Orchestration;
using Buildy.Infrastructure.Events;
using Buildy.Infrastructure.Persistence;
using Buildy.Infrastructure.Services;
using Buildy.Infrastructure.Workspace;
using Buildy.Validation.Implementations;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<BuildyDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Buildy") ?? "Data Source=buildy.db"));
builder.Services.AddDbContextFactory<BuildyDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Buildy") ?? "Data Source=buildy.db"));

builder.Services.AddScoped<IRunRepository, RunRepository>();
builder.Services.AddSingleton<IWorkspaceStore>(_ => new WorkspaceStore(Path.Combine(AppContext.BaseDirectory, "workspaces")));
builder.Services.AddSingleton<IRunEventPublisher, RunEventPublisher>();
builder.Services.AddSingleton<IRunEventReader>(sp => (RunEventPublisher)sp.GetRequiredService<IRunEventPublisher>());

builder.Services.AddSingleton<ISpecAgent, SpecAgent>();
builder.Services.AddSingleton<IPlanAgent, PlanAgent>();
builder.Services.AddSingleton<IAppCodeAgent, AppCodeAgent>();
builder.Services.AddSingleton<IInfraAgent, InfraAgent>();
builder.Services.AddSingleton<ITestValidator, TestValidator>();
builder.Services.AddSingleton<ISecurityValidator, SecurityValidator>();
builder.Services.AddSingleton<IDeployService, DeployService>();

builder.Services.AddScoped<RunOrchestrator>();
builder.Services.AddScoped<RunService>();

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("default", limiterOptions =>
    {
        limiterOptions.PermitLimit = 60;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 0;
    });
});

var app = builder.Build();

app.UseRateLimiter();
app.UseMiddleware<Buildy.Api.Middleware.DomainExceptionMiddleware>();

app.MapControllers().RequireRateLimiting("default");

app.Run();

public partial class Program { }
