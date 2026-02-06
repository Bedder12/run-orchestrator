using Buildy.Domain;

namespace Buildy.Application.Commands;

public sealed record RejectRunCommand(RunId RunId, string Reason);
