using CurriculumRegistration.Api.DTOs;
using Microsoft.AspNetCore.Http;

namespace CurriculumRegistration.Api.Services.Interfaces;

public interface IPdfImportService
{
    Task<PdfImportResponse> ExtractAsync(
        IFormFile file,
        CancellationToken cancellationToken);
}