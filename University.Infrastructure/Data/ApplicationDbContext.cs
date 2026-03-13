using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using University.Domain.Entities;
using University.Infrastructure.Identity;

namespace University.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // DbSets for all entities
    public DbSet<Student> Students => Set<Student>();
    public DbSet<StaffMember> StaffMembers => Set<StaffMember>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Program> Programs => Set<Program>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<ClassSchedule> ClassSchedules => Set<ClassSchedule>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<ExamResult> ExamResults => Set<ExamResult>();
    public DbSet<FeePayment> FeePayments => Set<FeePayment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply configurations
        ConfigureStudent(modelBuilder);
        ConfigureStaffMember(modelBuilder);
        ConfigureDepartment(modelBuilder);
        ConfigureProgram(modelBuilder);
        ConfigureCourse(modelBuilder);
        ConfigureEnrollment(modelBuilder);
        ConfigureClassSchedule(modelBuilder);
        ConfigureAttendance(modelBuilder);
        ConfigureExam(modelBuilder);
        ConfigureExamResult(modelBuilder);
        ConfigureFeePayment(modelBuilder);
    }

    private void ConfigureStudent(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Student>(entity =>
        {
            entity.ToTable("Students");
            entity.HasIndex(e => e.StudentId).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.GPA).HasPrecision(3, 2);
        });
    }

    private void ConfigureStaffMember(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<StaffMember>(entity =>
        {
            entity.ToTable("StaffMembers");
            entity.HasIndex(e => e.EmployeeId).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Salary).HasPrecision(18, 2);
        });
    }

    private void ConfigureDepartment(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Department>(entity =>
        {
            entity.ToTable("Departments");
            entity.HasIndex(e => e.DepartmentCode).IsUnique();

            entity.HasOne(d => d.HeadOfDepartment)
                .WithMany(s => s.ManagedDepartments)
                .HasForeignKey(d => d.HeadOfDepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    private void ConfigureProgram(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Program>(entity =>
        {
            entity.ToTable("Programs");
            entity.HasIndex(e => e.ProgramCode).IsUnique();
            entity.Property(e => e.TotalCredits).HasPrecision(5, 2);
        });
    }

    private void ConfigureCourse(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Course>(entity =>
        {
            entity.ToTable("Courses");
            entity.HasIndex(e => e.CourseCode).IsUnique();
            entity.Property(e => e.Credits).HasPrecision(4, 2);
        });
    }

    private void ConfigureEnrollment(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Enrollment>(entity =>
        {
            entity.ToTable("Enrollments");
            entity.Property(e => e.NumericGrade).HasPrecision(5, 2);

            entity.HasOne(e => e.Student)
                .WithMany(s => s.Enrollments)
                .HasForeignKey(e => e.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Course)
                .WithMany(c => c.Enrollments)
                .HasForeignKey(e => e.CourseId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    private void ConfigureClassSchedule(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ClassSchedule>(entity =>
        {
            entity.ToTable("ClassSchedules");

            entity.HasOne(cs => cs.Instructor)
                .WithMany(s => s.ClassSchedules)
                .HasForeignKey(cs => cs.InstructorId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    private void ConfigureAttendance(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Attendance>(entity =>
        {
            entity.ToTable("Attendances");

            entity.HasOne(a => a.Student)
                .WithMany(s => s.Attendances)
                .HasForeignKey(a => a.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    private void ConfigureExam(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Exam>(entity =>
        {
            entity.ToTable("Exams");
            entity.HasIndex(e => e.ExamCode).IsUnique();
            entity.Property(e => e.TotalMarks).HasPrecision(6, 2);
            entity.Property(e => e.PassingMarks).HasPrecision(6, 2);
        });
    }

    private void ConfigureExamResult(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ExamResult>(entity =>
        {
            entity.ToTable("ExamResults");
            entity.Property(e => e.MarksObtained).HasPrecision(6, 2);
            entity.Property(e => e.TotalMarks).HasPrecision(6, 2);
            entity.Property(e => e.Percentage).HasPrecision(5, 2);

            entity.HasOne(er => er.Student)
                .WithMany(s => s.ExamResults)
                .HasForeignKey(er => er.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    private void ConfigureFeePayment(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FeePayment>(entity =>
        {
            entity.ToTable("FeePayments");
            entity.HasIndex(e => e.ReceiptNumber).IsUnique();
            entity.Property(e => e.Amount).HasPrecision(18, 2);

            entity.HasOne(fp => fp.Student)
                .WithMany(s => s.FeePayments)
                .HasForeignKey(fp => fp.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
