using University.Domain.Common;

namespace University.Domain.Entities;

public class ClassSchedule : BaseEntity
{
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public Guid InstructorId { get; set; }
    public StaffMember Instructor { get; set; } = null!;
    public string Semester { get; set; } = string.Empty; // e.g., Fall 2026
    public string? Section { get; set; } // e.g., A, B
    public string DayOfWeek { get; set; } = string.Empty; // Monday, Tuesday, etc.
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public string? Room { get; set; }
    public string? Building { get; set; }
    public int MaxCapacity { get; set; }
    public int CurrentEnrollment { get; set; } = 0;

    // Navigation Properties
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
}
