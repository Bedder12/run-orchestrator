using System.ComponentModel.DataAnnotations;

namespace Buildy.Api.Models;

public sealed class StartRunRequest
{
    [Required]
    [MaxLength(4000)]
    public string Prompt { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? ProjectName { get; set; }
}

public sealed class RejectRunRequest
{
    [Required]
    [MaxLength(500)]
    public string Reason { get; set; } = string.Empty;
}
