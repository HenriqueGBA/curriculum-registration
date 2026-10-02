using System.ComponentModel.DataAnnotations;

namespace CurriculumRegistration.Api.DTOs;

public class CreateCandidateRequest
{
    [Required(ErrorMessage = "O nome completo é obrigatório.")]
    [MinLength(3, ErrorMessage = "O nome completo deve possuir pelo menos 3 caracteres.")]
    [MaxLength(150, ErrorMessage = "O nome completo deve possuir no máximo 150 caracteres.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "O e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "Informe um e-mail válido.")]
    [MaxLength(150, ErrorMessage = "O e-mail deve possuir no máximo 150 caracteres.")]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20, ErrorMessage = "O telefone deve possuir no máximo 20 caracteres.")]
    public string? Phone { get; set; }

    [MaxLength(80, ErrorMessage = "A área de interesse deve possuir no máximo 80 caracteres.")]
    public string? InterestedArea { get; set; }

    [MaxLength(1000, ErrorMessage = "O resumo profissional deve possuir no máximo 1000 caracteres.")]
    public string? ProfessionalSummary { get; set; }
}