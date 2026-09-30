using CurriculumRegistration.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace CurriculumRegistration.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Candidate> Candidates => Set<Candidate>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Candidate>(entity =>
        {
            entity.ToTable("Candidates");

            entity.HasKey(candidate => candidate.Id);

            entity.Property(candidate => candidate.FullName)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(candidate => candidate.Email)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(candidate => candidate.Phone)
                .HasMaxLength(30);

            entity.Property(candidate => candidate.InterestedArea)
                .HasMaxLength(150);

            entity.Property(candidate => candidate.ProfessionalSummary)
                .HasMaxLength(4000);

            entity.Property(candidate => candidate.CreatedAt)
                .IsRequired();

            entity.Property(candidate => candidate.UpdatedAt)
                .IsRequired();

            entity.HasIndex(candidate => candidate.Email);
        });
    }
}