using University.Domain.Common;

namespace University.Domain.Entities;

public class Attendance : BaseEntity
{
    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;
    public Guid ClassScheduleId { get; set; }
    public ClassSchedule ClassSchedule { get; set; } = null!;
    public DateTime Date { get; set; }
    public bool IsPresent { get; set; }
    public string? Remarks { get; set; }
}
