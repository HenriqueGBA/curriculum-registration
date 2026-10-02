using CurriculumRegistration.Api.Data;
using Microsoft.EntityFrameworkCore;
using CurriculumRegistration.Api.Services.Implementations;
using CurriculumRegistration.Api.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddScoped<IPdfImportService, PdfImportService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendLocal", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "https://localhost:5173",
                "http://localhost:4173",
                "https://localhost:4173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"));
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger(options =>
    {
        options.SerializeAsV2 = true;
    });

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint(
            "v1/swagger.json",
            "CurriculumRegistration.Api v1");
    });
}

app.UseHttpsRedirection();
app.UseCors("FrontendLocal");

app.MapControllers();

app.Run();
public partial class Program
{
}