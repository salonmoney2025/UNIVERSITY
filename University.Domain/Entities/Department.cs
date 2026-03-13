using University.Domain.Common;

namespace University.Domain.Entities;

public class Department : BaseEntity
{
    public string DepartmentCode { get; set; } = string.Empty; // e.g., CS, ENG, BUS
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid? HeadOfDepartmentId { get; set; } // Faculty member who is HOD
    public StaffMember? HeadOfDepartment { get; set; }
    public string? Building { get; set; }
    public string? OfficeNumber { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public ICollection<Program> Programs { get; set; } = new List<Program>();
    public ICollection<Course> Courses { get; set; } = new List<Course>();
    public ICollection<StaffMember> StaffMembers { get; set; } = new List<StaffMember>();
}
