namespace CurriculumRegistration.Api.Entities;

public class Candidate
{
    public Guid Id { get; set; }

    public required string FullName { get; set; }

    public required string Email { get; set; }

    public string? Phone { get; set; }

    public string? InterestedArea { get; set; }

    public string? ProfessionalSummary { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}