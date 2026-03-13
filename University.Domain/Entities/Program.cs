using University.Domain.Common;

namespace University.Domain.Entities;

public class Program : BaseEntity
{
    public string ProgramCode { get; set; } = string.Empty; // e.g., CS-BS, MBA
    public string Name { get; set; } = string.Empty; // e.g., Bachelor of Science in Computer Science
    public string Description { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public Department Department { get; set; } = null!;
    public int DurationYears { get; set; }
    public int DurationSemesters { get; set; }
    public decimal TotalCredits { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<Course> Courses { get; set; } = new List<Course>();
}
