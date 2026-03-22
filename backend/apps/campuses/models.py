from django.db import models
from django.core.validators import RegexValidator
from apps.authentication.models import BaseModel


class Campus(BaseModel):
    """
    Campus model representing different university campuses
    """
    # Phone number validator
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )

    name = models.CharField(max_length=200, unique=True)
    code = models.CharField(max_length=20, unique=True, db_index=True)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='Nigeria')
    phone = models.CharField(validators=[phone_regex], max_length=17)
    email = models.EmailField()
    is_active = models.BooleanField(default=True)
    
    # Flexible settings for campus-specific configurations
    settings = models.JSONField(
        default=dict,
        blank=True,
        help_text="Campus-specific settings and configurations"
    )

    class Meta:
        verbose_name = 'Campus'
        verbose_name_plural = 'Campuses'
        ordering = ['name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['is_active']),
            models.Index(fields=['city']),
        ]

    def __str__(self):
        return f"{self.name} ({self.code})"

    def clean(self):
        """Validate campus data"""
        from django.core.exceptions import ValidationError

        # Ensure code is uppercase
        if self.code:
            self.code = self.code.upper()

        # Ensure email is lowercase
        if self.email:
            self.email = self.email.lower()

    @property
    def total_students(self):
        """Get total number of students in this campus"""
        return self.users.filter(role='STUDENT', is_active=True).count()

    @property
    def total_staff(self):
        """Get total number of staff in this campus"""
        return self.users.filter(role='LECTURER', is_active=True).count()


class Department(BaseModel):
    """
    Department model representing academic departments within a campus
    """
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, db_index=True)
    campus = models.ForeignKey(
        Campus,
        on_delete=models.CASCADE,
        related_name='departments'
    )
    description = models.TextField(blank=True, null=True)
    head = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='headed_departments',
        limit_choices_to={'role__in': ['LECTURER', 'DEAN', 'ADMIN']}
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'
        ordering = ['campus', 'name']
        unique_together = [['campus', 'code']]
        indexes = [
            models.Index(fields=['campus', 'code']),
            models.Index(fields=['is_active']),
            models.Index(fields=['head']),
        ]

    def __str__(self):
        return f"{self.name} - {self.campus.name}"

    def clean(self):
        """Validate department data"""
        from django.core.exceptions import ValidationError

        # Ensure code is uppercase
        if self.code:
            self.code = self.code.upper()

        # Validate that head belongs to the same campus
        if self.head and self.head.campus != self.campus:
            raise ValidationError('Department head must belong to the same campus.')

    @property
    def total_students(self):
        """Get total number of students in this department"""
        return self.student_set.filter(user__is_active=True).count()

    @property
    def total_courses(self):
        """Get total number of courses in this department"""
        return self.course_set.filter(is_active=True).count()


class Faculty(BaseModel):
    """
    Faculty model representing academic faculties (grouping of departments)
    """
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, db_index=True)
    campus = models.ForeignKey(
        Campus,
        on_delete=models.CASCADE,
        related_name='faculties'
    )
    dean = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deanships',
        limit_choices_to={'role__in': ['DEAN', 'ADMIN']}
    )
    description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = 'Faculty'
        verbose_name_plural = 'Faculties'
        ordering = ['campus', 'name']
        unique_together = [['campus', 'code']]
        indexes = [
            models.Index(fields=['campus', 'code']),
            models.Index(fields=['dean']),
        ]

    def __str__(self):
        return f"{self.name} - {self.campus.name}"

    def clean(self):
        """Validate faculty data"""
        from django.core.exceptions import ValidationError

        # Ensure code is uppercase
        if self.code:
            self.code = self.code.upper()

        # Validate that dean belongs to the same campus
        if self.dean and self.dean.campus != self.campus:
            raise ValidationError('Faculty dean must belong to the same campus.')
