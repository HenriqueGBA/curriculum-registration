using CurriculumRegistration.Api.Data;
using Microsoft.EntityFrameworkCore;
using CurriculumRegistration.Api.Services.Implementations;
using CurriculumRegistration.Api.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddScoped<IPdfImportService, PdfImportService>();

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

app.MapControllers();

app.Run();
public partial class Program
{
}