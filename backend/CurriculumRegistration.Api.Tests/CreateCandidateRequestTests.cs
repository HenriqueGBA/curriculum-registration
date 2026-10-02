using System.ComponentModel.DataAnnotations;
using CurriculumRegistration.Api.DTOs;

namespace CurriculumRegistration.Api.Tests;

public class CreateCandidateRequestTests
{
    [Fact]
    public void Deve_aceitar_candidato_valido()
    {
        var request = new CreateCandidateRequest
        {
            FullName = "Maria Silva Oliveira",
            Email = "maria.oliveira@example.com",
            Phone = "(11) 98888-7777",
            InterestedArea = "Desenvolvimento Backend",
            ProfessionalSummary = "Desenvolvedora .NET"
        };

        var validationResults = Validate(request);

        Assert.Empty(validationResults);
    }

    [Fact]
    public void Deve_rejeitar_nome_vazio()
    {
        var request = new CreateCandidateRequest
        {
            FullName = string.Empty,
            Email = "maria.oliveira@example.com"
        };

        var validationResults = Validate(request);

        Assert.Contains(
            validationResults,
            result => result.ErrorMessage == "O nome completo é obrigatório.");
    }

    [Fact]
    public void Deve_rejeitar_nome_com_menos_de_tres_caracteres()
    {
        var request = new CreateCandidateRequest
        {
            FullName = "Ma",
            Email = "maria.oliveira@example.com"
        };

        var validationResults = Validate(request);

        Assert.Contains(
            validationResults,
            result => result.ErrorMessage ==
                "O nome completo deve possuir pelo menos 3 caracteres.");
    }

    [Fact]
    public void Deve_rejeitar_email_vazio()
    {
        var request = new CreateCandidateRequest
        {
            FullName = "Maria Silva Oliveira",
            Email = string.Empty
        };

        var validationResults = Validate(request);

        Assert.Contains(
            validationResults,
            result => result.ErrorMessage == "O e-mail é obrigatório.");
    }

    [Fact]
    public void Deve_rejeitar_email_invalido()
    {
        var request = new CreateCandidateRequest
        {
            FullName = "Maria Silva Oliveira",
            Email = "email-invalido"
        };

        var validationResults = Validate(request);

        Assert.Contains(
            validationResults,
            result => result.ErrorMessage == "Informe um e-mail válido.");
    }

    private static List<ValidationResult> Validate(
        CreateCandidateRequest request)
    {
        var context = new ValidationContext(request);
        var validationResults = new List<ValidationResult>();

        Validator.TryValidateObject(
            request,
            context,
            validationResults,
            validateAllProperties: true);

        return validationResults;
    }
}