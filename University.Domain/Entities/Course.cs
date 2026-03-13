using University.Domain.Common;

namespace University.Domain.Entities;

public class Course : BaseEntity
{
    public string CourseCode { get; set; } = string.Empty; // e.g., CS101
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Credits { get; set; }
    public Guid DepartmentId { get; set; }
    public Department Department { get; set; } = null!;
    public Guid? ProgramId { get; set; }
    public Program? Program { get; set; }
    public int? Semester { get; set; } // Which semester this course is typically taken
    public bool IsElective { get; set; } = false;
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<ClassSchedule> ClassSchedules { get; set; } = new List<ClassSchedule>();
}
