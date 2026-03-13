using University.Domain.Common;

namespace University.Domain.Entities;

public class Enrollment : BaseEntity
{
    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public Guid ClassScheduleId { get; set; }
    public ClassSchedule ClassSchedule { get; set; } = null!;
    public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;
    public string Semester { get; set; } = string.Empty; // e.g., Fall 2026
    public string? Grade { get; set; } // Final grade
    public decimal? NumericGrade { get; set; } // e.g., 85.5
    public string Status { get; set; } = "Enrolled"; // Enrolled, Completed, Dropped, Failed
}
