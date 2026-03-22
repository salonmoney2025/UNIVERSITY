from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.authentication.models import BaseModel
from decimal import Decimal


class FeeStructure(BaseModel):
    program = models.ForeignKey('courses.Program', on_delete=models.PROTECT, related_name='fee_structures')
    semester = models.CharField(max_length=20)
    academic_year = models.CharField(max_length=9)
    campus = models.ForeignKey('campuses.Campus', on_delete=models.PROTECT, related_name='fee_structures')
    tuition_fee = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.00)])
    lab_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), validators=[MinValueValidator(0.00)])
    library_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), validators=[MinValueValidator(0.00)])
    sports_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), validators=[MinValueValidator(0.00)])
    other_fees = models.JSONField(default=dict)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    due_date = models.DateField()
    late_fine_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), validators=[MinValueValidator(0.00), MaxValueValidator(100.00)])

    class Meta:
        verbose_name = 'Fee Structure'
        verbose_name_plural = 'Fee Structures'
        ordering = ['-academic_year', 'semester', 'program']

    def __str__(self):
        return f"{self.program.code} - {self.semester} {self.academic_year}"


class StudentFee(BaseModel):
    PENDING, PARTIAL, PAID, OVERDUE = 'PENDING', 'PARTIAL', 'PAID', 'OVERDUE'

    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='fees')
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.PROTECT, related_name='student_fees')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    balance = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    status = models.CharField(max_length=20, default=PENDING, db_index=True)
    due_date = models.DateField()

    class Meta:
        verbose_name = 'Student Fee'
        verbose_name_plural = 'Student Fees'
        ordering = ['-due_date']

    def __str__(self):
        return f"{self.student.student_id} - {self.fee_structure}"


class Payment(BaseModel):
    CASH, CARD, BANK_TRANSFER, MOBILE_MONEY = 'CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_MONEY'
    STRIPE, PAYPAL, FLUTTERWAVE, PAYSTACK = 'STRIPE', 'PAYPAL', 'FLUTTERWAVE', 'PAYSTACK'
    PENDING, SUCCESS, FAILED, REFUNDED = 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'

    student_fee = models.ForeignKey(StudentFee, on_delete=models.PROTECT, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    payment_method = models.CharField(max_length=20, db_index=True)
    transaction_id = models.CharField(max_length=100, unique=True, db_index=True)
    payment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default=PENDING, db_index=True)
    gateway_response = models.JSONField(default=dict)
    processed_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, related_name='processed_payments')
    receipt_number = models.CharField(max_length=50, unique=True, blank=True, null=True)

    class Meta:
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-payment_date']

    def __str__(self):
        return f"{self.transaction_id} - {self.amount} ({self.status})"


class Scholarship(BaseModel):
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=20, db_index=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.00)])
    criteria = models.TextField()
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Scholarship'
        verbose_name_plural = 'Scholarships'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.type})"


class StudentScholarship(BaseModel):
    ACTIVE, SUSPENDED, COMPLETED, REVOKED = 'ACTIVE', 'SUSPENDED', 'COMPLETED', 'REVOKED'

    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='scholarships')
    scholarship = models.ForeignKey(Scholarship, on_delete=models.PROTECT, related_name='recipients')
    amount_awarded = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.00)])
    academic_year = models.CharField(max_length=9)
    status = models.CharField(max_length=20, default=ACTIVE, db_index=True)
    awarded_date = models.DateField(auto_now_add=True)
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = 'Student Scholarship'
        verbose_name_plural = 'Student Scholarships'
        ordering = ['-awarded_date']

    def __str__(self):
        return f"{self.student.student_id} - {self.scholarship.name}"
