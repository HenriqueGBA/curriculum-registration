using System.Net;
using System.Text;

namespace CurriculumRegistration.Api.Tests;

public class PdfImportIntegrationTests :
    IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public PdfImportIntegrationTests(
        CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task ImportPdf_Deve_rejeitar_pdf_corrompido()
    {
        var corruptedPdf = Encoding.ASCII.GetBytes(
            """
            %PDF-1.4
            este arquivo possui cabeçalho PDF, mas está corrompido
            """);

        using var content = CreateMultipartContent(
            fileName: "curriculo-corrompido.pdf",
            fileBytes: corruptedPdf);

        var response = await _client.PostAsync(
            "/api/candidates/import-pdf",
            content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var responseBody = await response.Content.ReadAsStringAsync();

        Assert.Contains(
            "Não foi possível ler o conteúdo do arquivo PDF.",
            responseBody);
    }

    [Fact]
    public async Task ImportPdf_Deve_rejeitar_arquivo_vazio()
    {
        using var content = CreateMultipartContent(
            fileName: "curriculo.pdf",
            fileBytes: []);

        var response = await _client.PostAsync(
            "/api/candidates/import-pdf",
            content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var responseBody = await response.Content.ReadAsStringAsync();

        Assert.Contains(
            "É necessário enviar um arquivo PDF.",
            responseBody);
    }

    [Fact]
    public async Task ImportPdf_Deve_rejeitar_extensao_invalida()
    {
        using var content = CreateMultipartContent(
            fileName: "curriculo.txt",
            fileBytes: Encoding.UTF8.GetBytes("conteudo"));

        var response = await _client.PostAsync(
            "/api/candidates/import-pdf",
            content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var responseBody = await response.Content.ReadAsStringAsync();

        Assert.Contains(
            "Somente arquivos com extensão .pdf são aceitos.",
            responseBody);
    }

    [Fact]
    public async Task ImportPdf_Deve_rejeitar_arquivo_maior_que_5_mb()
    {
        var fileBytes = new byte[5 * 1024 * 1024 + 1];

        Encoding.ASCII.GetBytes("%PDF-1.4")
            .CopyTo(fileBytes, 0);

        using var content = CreateMultipartContent(
            fileName: "curriculo-grande.pdf",
            fileBytes: fileBytes);

        var response = await _client.PostAsync(
            "/api/candidates/import-pdf",
            content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var responseBody = await response.Content.ReadAsStringAsync();

        Assert.Contains(
            "O arquivo PDF deve possuir no máximo 5 MB.",
            responseBody);
    }

    [Fact]
    public async Task ImportPdf_Deve_rejeitar_cabecalho_invalido()
    {
        using var content = CreateMultipartContent(
            fileName: "curriculo.pdf",
            fileBytes: Encoding.UTF8.GetBytes("isto não é um PDF"));

        var response = await _client.PostAsync(
            "/api/candidates/import-pdf",
            content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var responseBody = await response.Content.ReadAsStringAsync();

        Assert.Contains(
            "O arquivo enviado não possui um cabeçalho PDF válido.",
            responseBody);
    }

    [Fact]
    public async Task ImportPdf_Deve_processar_pdf_valido()
    {
        var pdfBytes = CreatePdfBytes();

        using var content = CreateMultipartContent(
            fileName: "curriculo.pdf",
            fileBytes: pdfBytes);

        var response = await _client.PostAsync(
            "/api/candidates/import-pdf",
            content);

        var responseBody = await response.Content.ReadAsStringAsync();

        Assert.True(
            response.IsSuccessStatusCode,
            $"Status: {(int)response.StatusCode}\nResposta: {responseBody}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("Maria Silva", responseBody);
        Assert.Contains("maria.silva@example.com", responseBody);
    }

    private static MultipartFormDataContent CreateMultipartContent(
        string fileName,
        byte[] fileBytes)
    {
        var multipartContent = new MultipartFormDataContent();

        var fileContent = new ByteArrayContent(fileBytes);
        fileContent.Headers.ContentType =
            new System.Net.Http.Headers.MediaTypeHeaderValue(
                "application/pdf");

        multipartContent.Add(
            fileContent,
            "file",
            fileName);

        return multipartContent;
    }

    private static byte[] CreatePdfBytes()
{
    const string contentStream = """
BT
/F1 12 Tf
72 720 Td
(Maria Silva) Tj
0 -20 Td
(maria.silva@example.com) Tj
0 -20 Td
(11988887777) Tj
ET
""";

    var contentBytes = Encoding.ASCII.GetBytes(contentStream);

    var objects = new[]
    {
        Encoding.ASCII.GetBytes(
            """
            1 0 obj
            << /Type /Catalog /Pages 2 0 R >>
            endobj
            """),

        Encoding.ASCII.GetBytes(
            """
            2 0 obj
            << /Type /Pages /Kids [3 0 R] /Count 1 >>
            endobj
            """),

        Encoding.ASCII.GetBytes(
            """
            3 0 obj
            << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
            endobj
            """),

        Encoding.ASCII.GetBytes(
            $"""
            4 0 obj
            << /Length {contentBytes.Length} >>
            stream
            {contentStream}endstream
            endobj
            """),

        Encoding.ASCII.GetBytes(
            """
            5 0 obj
            << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
            endobj
            """)
    };

    using var stream = new MemoryStream();

    WriteAscii(stream, "%PDF-1.4\n");

    var offsets = new List<long>
    {
        0
    };

    foreach (var pdfObject in objects)
    {
        offsets.Add(stream.Position);
        stream.Write(pdfObject);
        WriteAscii(stream, "\n");
    }

    var xrefPosition = stream.Position;

    WriteAscii(stream, "xref\n");
    WriteAscii(stream, "0 6\n");
    WriteAscii(stream, "0000000000 65535 f \n");

    for (var index = 1; index < offsets.Count; index++)
    {
        WriteAscii(
            stream,
            $"{offsets[index]:D10} 00000 n \n");
    }

    WriteAscii(
        stream,
        """
        trailer
        << /Size 6 /Root 1 0 R >>
        startxref
        """);

    WriteAscii(stream, $"{xrefPosition}\n");
    WriteAscii(stream, "%%EOF\n");

    return stream.ToArray();
}

private static void WriteAscii(
    Stream stream,
    string value)
{
    var bytes = Encoding.ASCII.GetBytes(value);
    stream.Write(bytes);
}
}