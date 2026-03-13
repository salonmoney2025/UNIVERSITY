using University.Domain.Common;

namespace University.Domain.Entities;

public class FeePayment : BaseEntity
{
    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;
    public string ReceiptNumber { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty; // Cash, Card, Bank Transfer
    public string FeeType { get; set; } = string.Empty; // Tuition, Library, Lab, etc.
    public string Semester { get; set; } = string.Empty;
    public string Status { get; set; } = "Paid"; // Paid, Pending, Refunded
    public string? TransactionId { get; set; }
    public string? Remarks { get; set; }
}
