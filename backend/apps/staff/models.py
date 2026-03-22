from django.db import models
from django.core.validators import RegexValidator, MinValueValidator
from apps.authentication.models import BaseModel
from decimal import Decimal


class StaffMember(BaseModel):
    FULL_TIME = 'FULL_TIME'
    PART_TIME = 'PART_TIME'
    CONTRACT = 'CONTRACT'

    EMPLOYMENT_TYPE_CHOICES = (
        (FULL_TIME, 'Full Time'),
        (PART_TIME, 'Part Time'),
        (CONTRACT, 'Contract'),
    )

    ACTIVE = 'ACTIVE'
    ON_LEAVE = 'ON_LEAVE'
    SUSPENDED = 'SUSPENDED'
    TERMINATED = 'TERMINATED'

    STATUS_CHOICES = (
        (ACTIVE, 'Active'),
        (ON_LEAVE, 'On Leave'),
        (SUSPENDED, 'Suspended'),
        (TERMINATED, 'Terminated'),
    )

    user = models.OneToOneField('authentication.User', on_delete=models.CASCADE, related_name='staff_profile', limit_choices_to={'role': 'LECTURER'})
    staff_id = models.CharField(max_length=20, unique=True, db_index=True, editable=False)
    campus = models.ForeignKey('campuses.Campus', on_delete=models.PROTECT, related_name='staff_members')
    department = models.ForeignKey('campuses.Department', on_delete=models.PROTECT, related_name='staff_members', null=True, blank=True)
    designation = models.CharField(max_length=100)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, default=FULL_TIME, db_index=True)
    hire_date = models.DateField()
    salary = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.00)])
    qualifications = models.TextField(help_text="Academic qualifications and certifications")
    specialization = models.CharField(max_length=200, blank=True, null=True)
    office_location = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=ACTIVE, db_index=True)

    class Meta:
        verbose_name = 'Staff Member'
        verbose_name_plural = 'Staff Members'
        ordering = ['-hire_date', 'staff_id']
        indexes = [
            models.Index(fields=['staff_id']),
            models.Index(fields=['campus', 'status']),
            models.Index(fields=['department']),
            models.Index(fields=['employment_type']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.staff_id} - {self.user.get_full_name()}"


class StaffAttendance(BaseModel):
    PRESENT = 'PRESENT'
    ABSENT = 'ABSENT'
    HALF_DAY = 'HALF_DAY'
    ON_LEAVE = 'ON_LEAVE'

    STATUS_CHOICES = (
        (PRESENT, 'Present'),
        (ABSENT, 'Absent'),
        (HALF_DAY, 'Half Day'),
        (ON_LEAVE, 'On Leave'),
    )

    staff = models.ForeignKey(StaffMember, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(db_index=True)
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PRESENT, db_index=True)
    hours_worked = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = 'Staff Attendance'
        verbose_name_plural = 'Staff Attendances'
        ordering = ['-date']
        unique_together = [['staff', 'date']]
        indexes = [
            models.Index(fields=['staff', 'date']),
            models.Index(fields=['date']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.staff.staff_id} - {self.date} ({self.status})"
