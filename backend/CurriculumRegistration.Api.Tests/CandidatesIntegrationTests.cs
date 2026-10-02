using System.Net;
using System.Net.Http.Json;
using CurriculumRegistration.Api.DTOs;

namespace CurriculumRegistration.Api.Tests;

public class CandidatesIntegrationTests :
    IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public CandidatesIntegrationTests(
        CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Post_Deve_criar_candidato_valido()
    {
        var request = new
        {
            fullName = "Maria Silva Oliveira",
            email = "maria.oliveira@example.com",
            phone = "(11) 98888-7777",
            interestedArea = "Desenvolvimento Backend",
            professionalSummary = "Desenvolvedora .NET"
        };

        var response = await _client.PostAsJsonAsync(
            "/api/candidates",
            request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var candidate = await response.Content
            .ReadFromJsonAsync<CandidateResponse>();

        Assert.NotNull(candidate);
        Assert.NotEqual(Guid.Empty, candidate!.Id);
        Assert.Equal(
            "maria.oliveira@example.com",
            candidate.Email);
    }

    [Fact]
    public async Task Post_Deve_rejeitar_email_duplicado()
    {
        var request = new
        {
            fullName = "Maria Silva Oliveira",
            email = "duplicado@example.com"
        };

        var firstResponse = await _client.PostAsJsonAsync(
            "/api/candidates",
            request);

        var secondResponse = await _client.PostAsJsonAsync(
            "/api/candidates",
            request);

        Assert.Equal(HttpStatusCode.Created, firstResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, secondResponse.StatusCode);
    }

    [Fact]
    public async Task Post_Deve_rejeitar_dados_invalidos()
    {
        var request = new
        {
            fullName = "Ma",
            email = "email-invalido"
        };

        var response = await _client.PostAsJsonAsync(
            "/api/candidates",
            request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Get_Deve_retornar_candidato_criado()
    {
        var request = new
        {
            fullName = "João da Silva",
            email = "joao.silva@example.com"
        };

        var createResponse = await _client.PostAsJsonAsync(
            "/api/candidates",
            request);

        var responseBody = await createResponse.Content.ReadAsStringAsync();

        Assert.True(
            createResponse.IsSuccessStatusCode,
            $"Status: {(int)createResponse.StatusCode}\nResposta: {responseBody}");

        var createdCandidate = await createResponse.Content
            .ReadFromJsonAsync<CandidateResponse>();

        Assert.NotNull(createdCandidate);

        var getResponse = await _client.GetAsync(
            $"/api/candidates/{createdCandidate!.Id}");

        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        var candidate = await getResponse.Content
            .ReadFromJsonAsync<CandidateResponse>();

        Assert.NotNull(candidate);
        Assert.Equal(createdCandidate.Id, candidate!.Id);
        Assert.Equal("João da Silva", candidate.FullName);
    }

    [Fact]
    public async Task Get_Deve_retornar_lista_de_candidatos()
    {
        var request = new
        {
            fullName = "Ana Souza",
            email = "ana.souza@example.com"
        };

        await _client.PostAsJsonAsync(
            "/api/candidates",
            request);

        var response = await _client.GetAsync("/api/candidates");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var candidates = await response.Content
            .ReadFromJsonAsync<List<CandidateResponse>>();

        Assert.NotNull(candidates);
        Assert.Contains(
            candidates!,
            candidate => candidate.Email == "ana.souza@example.com");
    }
}