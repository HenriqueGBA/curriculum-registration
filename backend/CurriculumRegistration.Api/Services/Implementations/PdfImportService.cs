using System.Text;
using System.Text.RegularExpressions;
using CurriculumRegistration.Api.DTOs;
using CurriculumRegistration.Api.Services.Interfaces;
using UglyToad.PdfPig;
using UglyToad.PdfPig.DocumentLayoutAnalysis.TextExtractor;

namespace CurriculumRegistration.Api.Services.Implementations;

public class PdfImportService : IPdfImportService
{
    private const long MaxFileSize = 5 * 1024 * 1024;

    private static readonly Regex EmailRegex = new(
        @"[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex PhoneRegex = new(
        @"(?<!\d)(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9?\d{4}[-.\s]?\d{4})(?!\d)",
        RegexOptions.Compiled);

    public async Task<PdfImportResponse> ExtractAsync(
        IFormFile file,
        CancellationToken cancellationToken)
    {
        ValidateFile(file);

        await using var inputStream = file.OpenReadStream();
        await using var memoryStream = new MemoryStream();

        await inputStream.CopyToAsync(memoryStream, cancellationToken);

        var pdfBytes = memoryStream.ToArray();

        ValidatePdfHeader(pdfBytes);

        var extractedText = ExtractText(pdfBytes);

        var response = new PdfImportResponse
        {
            ExtractedText = extractedText,
            Email = ExtractEmail(extractedText),
            Phone = ExtractPhone(extractedText),
            FullName = ExtractFullName(extractedText),
            InterestedArea = ExtractSection(
                extractedText,
                "Área de interesse",
                "Área ou cargo de interesse",
                "Cargo pretendido",
                "Objetivo",
                "Objetivo profissional"),
            ProfessionalSummary = ExtractSection(
                extractedText,
                "Resumo profissional",
                "Perfil profissional",
                "Sobre mim",
                "Apresentação profissional")
        };

        AddWarnings(response);

        return response;
    }

    private static void ValidateFile(IFormFile? file)
    {
        if (file is null || file.Length == 0)
        {
            throw new InvalidDataException(
                "É necessário enviar um arquivo PDF.");
        }

        if (file.Length > MaxFileSize)
        {
            throw new InvalidDataException(
                "O arquivo PDF deve possuir no máximo 5 MB.");
        }

        var extension = Path.GetExtension(file.FileName);

        if (!string.Equals(extension, ".pdf", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidDataException(
                "Somente arquivos com extensão .pdf são aceitos.");
        }
    }

    private static void ValidatePdfHeader(byte[] pdfBytes)
    {
        var header = Encoding.ASCII.GetString(
            pdfBytes.Take(5).ToArray());

        if (!string.Equals(header, "%PDF-", StringComparison.Ordinal))
        {
            throw new InvalidDataException(
                "O arquivo enviado não possui um cabeçalho PDF válido.");
        }
    }

    private static string ExtractText(byte[] pdfBytes)
    {
        using var document = PdfDocument.Open(pdfBytes);

        var pages = document.GetPages()
            .Select(page => ContentOrderTextExtractor.GetText(page));

        return string.Join(
            Environment.NewLine,
            pages).Trim();
    }

    private static string? ExtractEmail(string text)
    {
        return EmailRegex
            .Match(text)
            .Value
            .Trim()
            .NullIfEmpty();
    }

    private static string? ExtractPhone(string text)
    {
        return PhoneRegex
            .Match(text)
            .Value
            .Trim()
            .NullIfEmpty();
    }

    private static string? ExtractFullName(string text)
    {
        var lines = text
            .Split(
                new[] { '\r', '\n' },
                StringSplitOptions.RemoveEmptyEntries)
            .Select(line => line.Trim())
            .Where(line => line.Length >= 3)
            .ToList();

        foreach (var line in lines)
        {
            if (EmailRegex.IsMatch(line))
            {
                continue;
            }

            if (PhoneRegex.IsMatch(line))
            {
                continue;
            }

            if (line.Contains('@'))
            {
                continue;
            }

            if (line.Length > 100)
            {
                continue;
            }

            return line;
        }

        return null;
    }
        private static string? ExtractSection(
        string text,
        params string[] sectionTitles)
    {
        var lines = text
            .Split(
                new[] { '\r', '\n' },
                StringSplitOptions.RemoveEmptyEntries)
            .Select(line => line.Trim())
            .Where(line => !string.IsNullOrWhiteSpace(line))
            .ToList();

        for (var index = 0; index < lines.Count; index++)
        {
            var currentLine = lines[index];

            var matchingTitle = sectionTitles.FirstOrDefault(title =>
                string.Equals(
                    Normalize(currentLine),
                    Normalize(title),
                    StringComparison.OrdinalIgnoreCase));

            if (matchingTitle is null)
            {
                continue;
            }

            var content = new List<string>();

            for (var nextIndex = index + 1; nextIndex < lines.Count; nextIndex++)
            {
                var nextLine = lines[nextIndex];

                if (IsSectionTitle(nextLine))
                {
                    break;
                }

                content.Add(nextLine);
            }

            return string.Join(" ", content)
                .Trim()
                .NullIfEmpty();
        }

        return null;
    }

    private static bool IsSectionTitle(string line)
    {
        var normalizedLine = Normalize(line);

        var knownTitles = new[]
        {
            "Área de interesse",
            "Área ou cargo de interesse",
            "Cargo pretendido",
            "Objetivo",
            "Objetivo profissional",
            "Resumo profissional",
            "Perfil profissional",
            "Sobre mim",
            "Experiência profissional",
            "Experiência",
            "Formação acadêmica",
            "Formação",
            "Tecnologias",
            "Competências",
            "Idiomas",
            "Certificações",
            "Contato"
        };

        return knownTitles.Any(title =>
            string.Equals(
                normalizedLine,
                Normalize(title),
                StringComparison.OrdinalIgnoreCase));
    }

    private static string Normalize(string value)
    {
        return string.Join(
            " ",
            value
                .Normalize()
                .Split(
                    (char[]?)null,
                    StringSplitOptions.RemoveEmptyEntries));
    }

    private static void AddWarnings(PdfImportResponse response)
    {
        if (string.IsNullOrWhiteSpace(response.ExtractedText))
        {
            response.Warnings.Add(
                "Não foi possível extrair texto do PDF. " +
                "O arquivo pode ser um documento escaneado como imagem.");
        }

        if (string.IsNullOrWhiteSpace(response.FullName))
        {
            response.Warnings.Add(
                "Nome não identificado automaticamente.");
        }

        if (string.IsNullOrWhiteSpace(response.Email))
        {
            response.Warnings.Add(
                "E-mail não identificado automaticamente.");
        }

        if (string.IsNullOrWhiteSpace(response.Phone))
        {
            response.Warnings.Add(
                "Telefone não identificado automaticamente.");
        }
        if (string.IsNullOrWhiteSpace(response.InterestedArea))
        {
            response.Warnings.Add(
                "Área ou cargo de interesse não identificado automaticamente.");
        }

        if (string.IsNullOrWhiteSpace(response.ProfessionalSummary))
        {
            response.Warnings.Add(
                "Resumo profissional não identificado automaticamente.");
        }
    }
}

internal static class StringExtensions
{
    public static string? NullIfEmpty(this string value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value;
    }
}