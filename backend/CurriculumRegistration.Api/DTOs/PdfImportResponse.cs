namespace CurriculumRegistration.Api.DTOs;

public class PdfImportResponse
{
    public string? FullName { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string ExtractedText { get; set; } = string.Empty;

    public List<string> Warnings { get; set; } = [];
}