using University.Domain.Common;
using University.Domain.Enums;

namespace University.Domain.Entities;

public class StaffMember : BaseEntity
{
    public string EmployeeId { get; set; } = string.Empty; // e.g., EMP2026001
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public DateTime HireDate { get; set; }
    public EmploymentStatus Status { get; set; } = EmploymentStatus.Active;

    // Employment Details
    public string Position { get; set; } = string.Empty; // e.g., Professor, Lecturer, Admin Staff
    public Guid DepartmentId { get; set; }
    public Department Department { get; set; } = null!;
    public decimal Salary { get; set; }
    public string? Qualifications { get; set; }
    public string? Specialization { get; set; }

    // Emergency Contact
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? EmergencyContactRelationship { get; set; }

    // Navigation Properties
    public ICollection<ClassSchedule> ClassSchedules { get; set; } = new List<ClassSchedule>();
    public ICollection<Department> ManagedDepartments { get; set; } = new List<Department>();
}
