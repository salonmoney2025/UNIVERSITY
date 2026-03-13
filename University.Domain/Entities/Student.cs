using University.Domain.Common;
using University.Domain.Enums;

namespace University.Domain.Entities;

public class Student : BaseEntity
{
    public string StudentId { get; set; } = string.Empty; //  Unique student ID (e.g., STU2026001)
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
    public DateTime EnrollmentDate { get; set; }
    public StudentStatus Status { get; set; } = StudentStatus.Active;

    // Academic Information
    public Guid ProgramId { get; set; }
    public Program Program { get; set; } = null!;
    public string? Batch { get; set; }
    public int? Semester { get; set; }
    public decimal? GPA { get; set; }

    // Guardian Information
    public string? GuardianName { get; set; }
    public string? GuardianPhone { get; set; }
    public string? GuardianEmail { get; set; }
    public string? GuardianRelationship { get; set; }

    // Navigation Properties
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<FeePayment> FeePayments { get; set; } = new List<FeePayment>();
    public ICollection<ExamResult> ExamResults { get; set; } = new List<ExamResult>();
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
}
