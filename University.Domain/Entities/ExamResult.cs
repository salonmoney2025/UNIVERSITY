using University.Domain.Common;

namespace University.Domain.Entities;

public class ExamResult : BaseEntity
{
    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;
    public Guid ExamId { get; set; }
    public Exam Exam { get; set; } = null!;
    public decimal MarksObtained { get; set; }
    public decimal TotalMarks { get; set; }
    public decimal Percentage { get; set; }
    public string? Grade { get; set; }
    public bool IsPassed { get; set; }
    public string? Remarks { get; set; }
}
