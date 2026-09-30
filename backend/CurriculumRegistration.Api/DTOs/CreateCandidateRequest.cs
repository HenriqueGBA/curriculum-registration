using System.ComponentModel.DataAnnotations;

namespace CurriculumRegistration.Api.DTOs;

public class CreateCandidateRequest
{
    [Required(ErrorMessage = "O nome completo é obrigatório.")]
    [MinLength(3, ErrorMessage = "O nome completo deve possuir pelo menos 3 caracteres.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "O e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "Informe um e-mail válido.")]
    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string? InterestedArea { get; set; }

    public string? ProfessionalSummary { get; set; }
}