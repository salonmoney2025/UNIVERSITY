from django.db import models
from django.core.validators import MinValueValidator
from apps.authentication.models import BaseModel


class Program(BaseModel):
    BACHELOR = 'BACHELOR'
    MASTER = 'MASTER'
    PHD = 'PHD'
    DIPLOMA = 'DIPLOMA'
    CERTIFICATE = 'CERTIFICATE'

    DEGREE_TYPE_CHOICES = (
        (BACHELOR, 'Bachelor'),
        (MASTER, 'Master'),
        (PHD, 'PhD'),
        (DIPLOMA, 'Diploma'),
        (CERTIFICATE, 'Certificate'),
    )

    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True, db_index=True)
    campus = models.ForeignKey('campuses.Campus', on_delete=models.PROTECT, related_name='programs')
    department = models.ForeignKey('campuses.Department', on_delete=models.PROTECT, related_name='programs')
    degree_type = models.CharField(max_length=20, choices=DEGREE_TYPE_CHOICES, db_index=True)
    duration_years = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    total_credits = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    description = models.TextField()
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Program'
        verbose_name_plural = 'Programs'
        ordering = ['campus', 'degree_type', 'name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['campus', 'department']),
            models.Index(fields=['degree_type']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.code})"


class Course(BaseModel):
    code = models.CharField(max_length=20, unique=True, db_index=True)
    title = models.CharField(max_length=200)
    campus = models.ForeignKey('campuses.Campus', on_delete=models.PROTECT, related_name='courses')
    department = models.ForeignKey('campuses.Department', on_delete=models.PROTECT, related_name='courses')
    credits = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    description = models.TextField()
    syllabus = models.TextField(blank=True, null=True)
    prerequisites = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='required_for')
    is_elective = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'
        ordering = ['code']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['campus', 'department']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_elective']),
        ]

    def __str__(self):
        return f"{self.code} - {self.title}"


class CourseOffering(BaseModel):
    OPEN = 'OPEN'
    CLOSED = 'CLOSED'
    IN_PROGRESS = 'IN_PROGRESS'
    COMPLETED = 'COMPLETED'

    STATUS_CHOICES = (
        (OPEN, 'Open'),
        (CLOSED, 'Closed'),
        (IN_PROGRESS, 'In Progress'),
        (COMPLETED, 'Completed'),
    )

    course = models.ForeignKey(Course, on_delete=models.PROTECT, related_name='offerings')
    semester = models.CharField(max_length=20)
    academic_year = models.CharField(max_length=9)
    campus = models.ForeignKey('campuses.Campus', on_delete=models.PROTECT, related_name='course_offerings')
    instructor = models.ForeignKey('staff.StaffMember', on_delete=models.SET_NULL, null=True, related_name='taught_courses')
    schedule = models.JSONField(default=dict, help_text="Days and times as JSON (e.g., {'Monday': '10:00-12:00', 'Wednesday': '10:00-12:00'})")
    room = models.CharField(max_length=50, blank=True, null=True)
    max_students = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    enrolled_count = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=OPEN, db_index=True)

    class Meta:
        verbose_name = 'Course Offering'
        verbose_name_plural = 'Course Offerings'
        ordering = ['-academic_year', 'semester', 'course__code']
        unique_together = [['course', 'semester', 'academic_year', 'campus']]
        indexes = [
            models.Index(fields=['course', 'semester']),
            models.Index(fields=['academic_year']),
            models.Index(fields=['campus', 'status']),
            models.Index(fields=['instructor']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.course.code} - {self.semester} {self.academic_year}"

    @property
    def is_full(self):
        return self.enrolled_count >= self.max_students

    @property
    def available_slots(self):
        return max(0, self.max_students - self.enrolled_count)
