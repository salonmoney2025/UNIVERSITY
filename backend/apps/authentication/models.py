import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.core.validators import RegexValidator


class BaseModel(models.Model):
    """
    Abstract base model with common fields for all models
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True

    def soft_delete(self):
        """Soft delete the object"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        """Restore a soft deleted object"""
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class CustomUserManager(BaseUserManager):
    """
    Custom user manager for email-based authentication
    """
    def create_user(self, email, password=None, **extra_fields):
        """
        Create and save a regular user with the given email and password
        """
        if not email:
            raise ValueError('The Email field must be set')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and save a superuser with the given email and password
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'SUPER_ADMIN')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, BaseModel):
    """
    Custom User model with email as username and role-based access
    """
    # Role choices - Comprehensive EBKUST Portal Roles
    # Top-level Administration
    SUPER_ADMIN = 'SUPER_ADMIN'
    ADMIN = 'ADMIN'
    CAMPUS_ADMIN = 'CAMPUS_ADMIN'
    CHANCELLOR = 'CHANCELLOR'

    # Academic Roles
    DEAN = 'DEAN'
    HEAD_OF_DEPARTMENT = 'HEAD_OF_DEPARTMENT'
    LECTURER = 'LECTURER'
    PART_TIME_LECTURER = 'PART_TIME_LECTURER'
    FACULTY_ADMIN = 'FACULTY_ADMIN'
    FACULTY_EXAM = 'FACULTY_EXAM'

    # Registry Roles
    REGISTRY_ADMIN = 'REGISTRY_ADMIN'
    REGISTRY = 'REGISTRY'
    REGISTRY_ADMISSION = 'REGISTRY_ADMISSION'
    REGISTRY_HR = 'REGISTRY_HR'
    REGISTRY_ACADEMIC = 'REGISTRY_ACADEMIC'

    # Finance Roles
    FINANCE = 'FINANCE'
    FINANCE_STAFF = 'FINANCE_STAFF'
    FINANCE_SECRETARIAT = 'FINANCE_SECRETARIAT'
    FINANCE_SECRETARIAT_STAFF = 'FINANCE_SECRETARIAT_STAFF'
    ACCOUNTANT = 'ACCOUNTANT'

    # Student Services
    STUDENT_SECTION = 'STUDENT_SECTION'
    STUDENT_SECTION_STAFF = 'STUDENT_SECTION_STAFF'
    STUDENT_WARDEN = 'STUDENT_WARDEN'

    # Business & Operations
    BUSINESS_CENTER = 'BUSINESS_CENTER'
    CAMPUS_BUSINESS_CENTER = 'CAMPUS_BUSINESS_CENTER'

    # Support Services
    LIBRARY = 'LIBRARY'
    ID_CARD_PRINTING = 'ID_CARD_PRINTING'
    HELP_DESK = 'HELP_DESK'
    HUMAN_RESOURCES = 'HUMAN_RESOURCES'

    # Specialized Programs
    ELEARNING_ADMIN = 'ELEARNING_ADMIN'
    SPS_ADMIN = 'SPS_ADMIN'  # School of Professional Studies
    SPS_STAFF = 'SPS_STAFF'
    EXTRAMURAL_STUDIES = 'EXTRAMURAL_STUDIES'

    # Examination
    EXAMS = 'EXAMS'

    # End Users
    STUDENT = 'STUDENT'
    PARENT = 'PARENT'

    ROLE_CHOICES = (
        # Top-level Administration
        (SUPER_ADMIN, 'Super Admin'),
        (ADMIN, 'Admin'),
        (CAMPUS_ADMIN, 'Campus Admin'),
        (CHANCELLOR, 'Chancellor'),

        # Academic Roles
        (DEAN, 'Dean'),
        (HEAD_OF_DEPARTMENT, 'Head of Department'),
        (LECTURER, 'Lecturer'),
        (PART_TIME_LECTURER, 'Part-Time Lecturer'),
        (FACULTY_ADMIN, 'Faculty Admin'),
        (FACULTY_EXAM, 'Faculty Exam'),

        # Registry Roles
        (REGISTRY_ADMIN, 'Registry Admin'),
        (REGISTRY, 'Registry'),
        (REGISTRY_ADMISSION, 'Registry Admission'),
        (REGISTRY_HR, 'Registry HR'),
        (REGISTRY_ACADEMIC, 'Registry Academic'),

        # Finance Roles
        (FINANCE, 'Finance'),
        (FINANCE_STAFF, 'Finance Staff'),
        (FINANCE_SECRETARIAT, 'Finance Secretariat'),
        (FINANCE_SECRETARIAT_STAFF, 'Finance Secretariat Staff'),
        (ACCOUNTANT, 'Accountant'),

        # Student Services
        (STUDENT_SECTION, 'Student Section'),
        (STUDENT_SECTION_STAFF, 'Student Section Staff'),
        (STUDENT_WARDEN, 'Student Warden'),

        # Business & Operations
        (BUSINESS_CENTER, 'Business Center'),
        (CAMPUS_BUSINESS_CENTER, 'Campus Business Center'),

        # Support Services
        (LIBRARY, 'Library'),
        (ID_CARD_PRINTING, 'ID Card Printing'),
        (HELP_DESK, 'Help Desk'),
        (HUMAN_RESOURCES, 'Human Resources'),

        # Specialized Programs
        (ELEARNING_ADMIN, 'eLearning Admin'),
        (SPS_ADMIN, 'SPS Admin'),
        (SPS_STAFF, 'SPS Staff'),
        (EXTRAMURAL_STUDIES, 'Extramural Studies'),

        # Examination
        (EXAMS, 'Exams'),

        # End Users
        (STUDENT, 'Student'),
        (PARENT, 'Parent'),
    )

    # Gender choices
    MALE = 'MALE'
    FEMALE = 'FEMALE'
    OTHER = 'OTHER'

    GENDER_CHOICES = (
        (MALE, 'Male'),
        (FEMALE, 'Female'),
        (OTHER, 'Other'),
    )

    # Phone number validator
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )

    # Core fields
    email = models.EmailField(unique=True, max_length=255, db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(validators=[phone_regex], max_length=17, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    photo = models.ImageField(upload_to='users/photos/', blank=True, null=True)

    # Status fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    # Role and campus
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default=STUDENT, db_index=True)
    campus = models.ForeignKey(
        'campuses.Campus',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )

    # Override PermissionsMixin fields to avoid reverse accessor clashes
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        related_name='custom_user_set',
        related_query_name='custom_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        related_name='custom_user_set',
        related_query_name='custom_user',
    )

    # Timestamps
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)

    # Manager
    objects = CustomUserManager()

    # Authentication field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['campus']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    def get_full_name(self):
        """Return the user's full name"""
        return f"{self.first_name} {self.last_name}".strip()

    def get_short_name(self):
        """Return the user's first name"""
        return self.first_name

    @property
    def is_student(self):
        """Check if user is a student"""
        return self.role == self.STUDENT

    @property
    def is_lecturer(self):
        """Check if user is a lecturer"""
        return self.role in [self.LECTURER, self.PART_TIME_LECTURER]

    @property
    def is_admin_user(self):
        """Check if user has admin privileges"""
        return self.role in [
            self.SUPER_ADMIN, self.ADMIN, self.CAMPUS_ADMIN, self.CHANCELLOR,
            self.REGISTRY_ADMIN, self.DEAN, self.HEAD_OF_DEPARTMENT, self.FACULTY_ADMIN
        ]

    @property
    def is_finance_user(self):
        """Check if user has finance access"""
        return self.role in [
            self.SUPER_ADMIN, self.ADMIN, self.FINANCE, self.FINANCE_STAFF,
            self.FINANCE_SECRETARIAT, self.FINANCE_SECRETARIAT_STAFF, self.ACCOUNTANT
        ]

    @property
    def is_registry_user(self):
        """Check if user is in registry"""
        return self.role in [
            self.REGISTRY_ADMIN, self.REGISTRY, self.REGISTRY_ADMISSION,
            self.REGISTRY_HR, self.REGISTRY_ACADEMIC
        ]

    @property
    def is_academic_staff(self):
        """Check if user is academic staff"""
        return self.role in [
            self.DEAN, self.HEAD_OF_DEPARTMENT, self.LECTURER, self.PART_TIME_LECTURER,
            self.FACULTY_ADMIN, self.FACULTY_EXAM
        ]

    @property
    def is_business_center_user(self):
        """Check if user works in business center"""
        return self.role in [self.BUSINESS_CENTER, self.CAMPUS_BUSINESS_CENTER]

    @property
    def can_manage_students(self):
        """Check if user can manage students"""
        return self.role in [
            self.SUPER_ADMIN, self.ADMIN, self.CAMPUS_ADMIN, self.REGISTRY_ADMIN,
            self.REGISTRY, self.REGISTRY_ADMISSION, self.REGISTRY_ACADEMIC,
            self.STUDENT_SECTION, self.STUDENT_SECTION_STAFF, self.DEAN,
            self.HEAD_OF_DEPARTMENT
        ]

    @property
    def can_manage_exams(self):
        """Check if user can manage exams"""
        return self.role in [
            self.SUPER_ADMIN, self.ADMIN, self.CAMPUS_ADMIN, self.EXAMS,
            self.FACULTY_EXAM, self.DEAN, self.HEAD_OF_DEPARTMENT, self.REGISTRY_ACADEMIC
        ]

    @property
    def can_view_financial_reports(self):
        """Check if user can view financial reports"""
        return self.role in [
            self.SUPER_ADMIN, self.ADMIN, self.CHANCELLOR, self.FINANCE,
            self.FINANCE_SECRETARIAT, self.ACCOUNTANT
        ]

    def clean(self):
        """Validate user data"""
        from django.core.exceptions import ValidationError

        # Ensure email is lowercase
        if self.email:
            self.email = self.email.lower()

        # Roles that require campus assignment
        campus_required_roles = [
            self.CAMPUS_ADMIN, self.CAMPUS_BUSINESS_CENTER, self.DEAN,
            self.HEAD_OF_DEPARTMENT, self.LECTURER, self.PART_TIME_LECTURER,
            self.FACULTY_ADMIN, self.FACULTY_EXAM, self.STUDENT, self.PARENT,
            self.STUDENT_SECTION, self.STUDENT_SECTION_STAFF, self.STUDENT_WARDEN,
            self.LIBRARY, self.ID_CARD_PRINTING, self.HELP_DESK,
            self.SPS_STAFF, self.EXTRAMURAL_STUDIES
        ]

        # Validate role and campus
        if self.role in campus_required_roles and not self.campus:
            raise ValidationError(f'Campus is required for {self.get_role_display()} role.')

        # System-wide roles that should NOT have campus
        system_wide_roles = [
            self.SUPER_ADMIN, self.CHANCELLOR, self.REGISTRY_ADMIN,
            self.FINANCE_SECRETARIAT, self.ELEARNING_ADMIN, self.SPS_ADMIN
        ]

        if self.role in system_wide_roles and self.campus:
            raise ValidationError(f'{self.get_role_display()} role should not be assigned to a specific campus.')

    def save(self, *args, **kwargs):
        """Override save to run validation"""
        self.full_clean()
        super().save(*args, **kwargs)
