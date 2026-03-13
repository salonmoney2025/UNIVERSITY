using University.Domain.Common;

namespace University.Domain.Entities;

public class Exam : BaseEntity
{
    public string ExamCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public string ExamType { get; set; } = string.Empty; // Midterm, Final, Quiz
    public DateTime ExamDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public decimal TotalMarks { get; set; }
    public decimal PassingMarks { get; set; }
    public string? Room { get; set; }
    public string Semester { get; set; } = string.Empty;

    // Navigation Properties
    public ICollection<ExamResult> ExamResults { get; set; } = new List<ExamResult>();
}
