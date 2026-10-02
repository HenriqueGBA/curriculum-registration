using CurriculumRegistration.Api.Data;
using CurriculumRegistration.Api.DTOs;
using CurriculumRegistration.Api.Entities;
using CurriculumRegistration.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CurriculumRegistration.Api.Controllers;

[ApiController]
[Route("api/candidates")]
public class CandidatesController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly IPdfImportService _pdfImportService;

    public CandidatesController(
        AppDbContext dbContext,
        IPdfImportService pdfImportService)
    {
        _dbContext = dbContext;
        _pdfImportService = pdfImportService;
    }

    [HttpPost]
    public async Task<ActionResult<CandidateResponse>> Create(
        CreateCandidateRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var emailAlreadyExists = await _dbContext.Candidates
            .AnyAsync(
                candidate => candidate.Email == normalizedEmail,
                cancellationToken);

        if (emailAlreadyExists)
        {
            return Conflict(new
            {
                message = "Já existe um candidato cadastrado com este e-mail."
            });
        }

        var now = DateTime.UtcNow;

        var candidate = new Candidate
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName.Trim(),
            Email = normalizedEmail,
            Phone = request.Phone?.Trim(),
            InterestedArea = request.InterestedArea?.Trim(),
            ProfessionalSummary = request.ProfessionalSummary?.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };

        _dbContext.Candidates.Add(candidate);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var response = new CandidateResponse
        {
            Id = candidate.Id,
            FullName = candidate.FullName,
            Email = candidate.Email,
            Phone = candidate.Phone,
            InterestedArea = candidate.InterestedArea,
            ProfessionalSummary = candidate.ProfessionalSummary,
            CreatedAt = candidate.CreatedAt
        };

        return CreatedAtAction(
            nameof(GetById),
            new { id = candidate.Id },
            response);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CandidateResponse>>> GetAll(
        CancellationToken cancellationToken)
    {
        var candidates = await _dbContext.Candidates
            .AsNoTracking()
            .OrderByDescending(candidate => candidate.CreatedAt)
            .Select(candidate => new CandidateResponse
            {
                Id = candidate.Id,
                FullName = candidate.FullName,
                Email = candidate.Email,
                Phone = candidate.Phone,
                InterestedArea = candidate.InterestedArea,
                ProfessionalSummary = candidate.ProfessionalSummary,
                CreatedAt = candidate.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(candidates);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CandidateResponse>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var candidate = await _dbContext.Candidates
            .AsNoTracking()
            .FirstOrDefaultAsync(
                item => item.Id == id,
                cancellationToken);

        if (candidate is null)
        {
            return NotFound(new
            {
                message = "Candidato não encontrado."
            });
        }

        var response = new CandidateResponse
        {
            Id = candidate.Id,
            FullName = candidate.FullName,
            Email = candidate.Email,
            Phone = candidate.Phone,
            InterestedArea = candidate.InterestedArea,
            ProfessionalSummary = candidate.ProfessionalSummary,
            CreatedAt = candidate.CreatedAt
        };

        return Ok(response);
    }

    [HttpPost("import-pdf")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<PdfImportResponse>> ImportPdf(
        IFormFile file,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await _pdfImportService.ExtractAsync(
                file,
                cancellationToken);

            return Ok(response);
        }
        catch (InvalidDataException exception)
        {
            return BadRequest(new
            {
                message = exception.Message
            });
        }
        catch (Exception)
        {
            return BadRequest(new
            {
                message = "Não foi possível ler o conteúdo do arquivo PDF."
            });
        }
    }
}