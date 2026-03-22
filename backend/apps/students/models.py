from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from apps.authentication.models import BaseModel
from decimal import Decimal


class Student(BaseModel):
    ACTIVE = 'ACTIVE'
    SUSPENDED = 'SUSPENDED'
    GRADUATED = 'GRADUATED'
    WITHDRAWN = 'WITHDRAWN'
    DEFERRED = 'DEFERRED'

    ENROLLMENT_STATUS_CHOICES = (
        (ACTIVE, 'Active'),
        (SUSPENDED, 'Suspended'),
        (GRADUATED, 'Graduated'),
        (WITHDRAWN, 'Withdrawn'),
        (DEFERRED, 'Deferred'),
    )

    BLOOD_GROUP_CHOICES = (
        ('A+', 'A Positive'),
        ('A-', 'A Negative'),
        ('B+', 'B Positive'),
        ('B-', 'B Negative'),
        ('AB+', 'AB Positive'),
        ('AB-', 'AB Negative'),
        ('O+', 'O Positive'),
        ('O-', 'O Negative'),
    )

    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )

    user = models.OneToOneField('authentication.User', on_delete=models.CASCADE, related_name='student_profile', limit_choices_to={'role': 'STUDENT'})
    student_id = models.CharField(max_length=20, unique=True, db_index=True, editable=False)
    campus = models.ForeignKey('campuses.Campus', on_delete=models.PROTECT, related_name='students')
    department = models.ForeignKey('campuses.Department', on_delete=models.PROTECT, related_name='students')
    program = models.ForeignKey('courses.Program', on_delete=models.PROTECT, related_name='students')
    admission_date = models.DateField()
    enrollment_status = models.CharField(max_length=20, choices=ENROLLMENT_STATUS_CHOICES, default=ACTIVE, db_index=True)
    current_semester = models.PositiveIntegerField(default=1)
    gpa = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal('0.00'), validators=[MinValueValidator(0.00), MaxValueValidator(4.00)])
    guardian_name = models.CharField(max_length=200)
    guardian_phone = models.CharField(validators=[phone_regex], max_length=17)
    guardian_email = models.EmailField(blank=True, null=True)
    medical_info = models.TextField(blank=True, null=True, help_text="Medical conditions or allergies")
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES, blank=True, null=True)
    address = models.TextField()
    emergency_contact = models.CharField(validators=[phone_regex], max_length=17)

    class Meta:
        verbose_name = 'Student'
        verbose_name_plural = 'Students'
        ordering = ['-admission_date', 'student_id']
        indexes = [
            models.Index(fields=['student_id']),
            models.Index(fields=['campus', 'enrollment_status']),
            models.Index(fields=['department']),
            models.Index(fields=['program']),
            models.Index(fields=['enrollment_status']),
        ]

    def __str__(self):
        return f"{self.student_id} - {self.user.get_full_name()}"


class Enrollment(BaseModel):
    ENROLLED = 'ENROLLED'
    COMPLETED = 'COMPLETED'
    DROPPED = 'DROPPED'
    FAILED = 'FAILED'

    STATUS_CHOICES = (
        (ENROLLED, 'Enrolled'),
        (COMPLETED, 'Completed'),
        (DROPPED, 'Dropped'),
        (FAILED, 'Failed'),
    )

    GRADE_CHOICES = (
        ('A', 'A (4.0)'),
        ('B', 'B (3.0)'),
        ('C', 'C (2.0)'),
        ('D', 'D (1.0)'),
        ('F', 'F (0.0)'),
        ('I', 'Incomplete'),
        ('W', 'Withdrawn'),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    course_offering = models.ForeignKey('courses.CourseOffering', on_delete=models.PROTECT, related_name='enrollments')
    semester = models.CharField(max_length=20)
    academic_year = models.CharField(max_length=9)
    enrollment_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=ENROLLED, db_index=True)
    grade = models.CharField(max_length=2, choices=GRADE_CHOICES, blank=True, null=True)
    grade_point = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0.00), MaxValueValidator(4.00)])

    class Meta:
        verbose_name = 'Enrollment'
        verbose_name_plural = 'Enrollments'
        ordering = ['-enrollment_date']
        unique_together = [['student', 'course_offering']]
        indexes = [
            models.Index(fields=['student', 'semester']),
            models.Index(fields=['course_offering', 'status']),
            models.Index(fields=['academic_year']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.student.student_id} - {self.course_offering.course.code}"


class Attendance(BaseModel):
    PRESENT = 'PRESENT'
    ABSENT = 'ABSENT'
    LATE = 'LATE'
    EXCUSED = 'EXCUSED'

    STATUS_CHOICES = (
        (PRESENT, 'Present'),
        (ABSENT, 'Absent'),
        (LATE, 'Late'),
        (EXCUSED, 'Excused'),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendances')
    course_offering = models.ForeignKey('courses.CourseOffering', on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=ABSENT, db_index=True)
    marked_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, related_name='marked_attendances', limit_choices_to={'role__in': ['LECTURER', 'ADMIN']})
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = 'Attendance'
        verbose_name_plural = 'Attendances'
        ordering = ['-date']
        unique_together = [['student', 'course_offering', 'date']]
        indexes = [
            models.Index(fields=['student', 'date']),
            models.Index(fields=['course_offering', 'date']),
            models.Index(fields=['status']),
            models.Index(fields=['date']),
        ]

    def __str__(self):
        return f"{self.student.student_id} - {self.course_offering.course.code} - {self.date} ({self.status})"
