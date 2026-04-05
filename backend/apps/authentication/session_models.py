"""
Session Management Models
Track and manage user sessions across devices
"""
import uuid
from django.db import models
from django.utils import timezone
from .models import BaseModel, User


class UserSession(BaseModel):
    """
    Track active user sessions across devices
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sessions'
    )

    # Session identification
    session_token = models.CharField(
        max_length=500,
        unique=True,
        db_index=True,
        help_text="JWT token or session ID"
    )
    refresh_token = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text="JWT refresh token"
    )

    # Device information
    device_type = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Mobile, Desktop, Tablet"
    )
    device_name = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Device model or name"
    )
    browser = models.CharField(max_length=100, blank=True, null=True)
    browser_version = models.CharField(max_length=50, blank=True, null=True)
    operating_system = models.CharField(max_length=100, blank=True, null=True)
    os_version = models.CharField(max_length=50, blank=True, null=True)

    # Location information
    ip_address = models.GenericIPAddressField()
    country = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        blank=True,
        null=True
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        blank=True,
        null=True
    )

    # Session metadata
    user_agent = models.TextField(blank=True, null=True)
    is_mobile = models.BooleanField(default=False)
    is_bot = models.BooleanField(default=False)

    # Session status
    is_active = models.BooleanField(default=True, db_index=True)
    last_activity = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()

    # Login information
    login_method = models.CharField(
        max_length=50,
        default='PASSWORD',
        choices=(
            ('PASSWORD', 'Password'),
            ('2FA', 'Two-Factor Authentication'),
            ('SSO', 'Single Sign-On'),
            ('SOCIAL', 'Social Login'),
        )
    )
    login_at = models.DateTimeField(auto_now_add=True)
    logout_at = models.DateTimeField(null=True, blank=True)

    # Security flags
    is_suspicious = models.BooleanField(
        default=False,
        help_text="Flagged for suspicious activity"
    )
    force_logout = models.BooleanField(
        default=False,
        help_text="Admin can force logout"
    )

    class Meta:
        verbose_name = "User Session"
        verbose_name_plural = "User Sessions"
        ordering = ['-last_activity']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['session_token']),
            models.Index(fields=['ip_address', 'user']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.device_type or 'Unknown'} ({self.ip_address})"

    @property
    def is_expired(self):
        """Check if session has expired"""
        return timezone.now() > self.expires_at

    @property
    def is_current(self):
        """Check if this is the current session"""
        # This would be determined by comparing with current request session
        return self.is_active and not self.is_expired

    def terminate(self):
        """Terminate this session"""
        self.is_active = False
        self.logout_at = timezone.now()
        self.save(update_fields=['is_active', 'logout_at', 'updated_at'])

    def extend(self, hours=24):
        """Extend session expiration"""
        from datetime import timedelta
        self.expires_at = timezone.now() + timedelta(hours=hours)
        self.save(update_fields=['expires_at', 'updated_at'])


class SessionActivity(BaseModel):
    """
    Log of activities during a session
    """
    session = models.ForeignKey(
        UserSession,
        on_delete=models.CASCADE,
        related_name='activities'
    )

    # Activity details
    activity_type = models.CharField(
        max_length=50,
        choices=(
            ('PAGE_VIEW', 'Page View'),
            ('API_CALL', 'API Call'),
            ('LOGIN', 'Login'),
            ('LOGOUT', 'Logout'),
            ('PASSWORD_CHANGE', 'Password Change'),
            ('PERMISSION_CHANGE', 'Permission Change'),
            ('PROFILE_UPDATE', 'Profile Update'),
            ('DATA_EXPORT', 'Data Export'),
            ('SUSPICIOUS', 'Suspicious Activity'),
        )
    )
    activity_description = models.CharField(max_length=255)
    url = models.CharField(max_length=500, blank=True, null=True)
    http_method = models.CharField(max_length=10, blank=True, null=True)

    # Request metadata
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)

    # Response metadata
    status_code = models.IntegerField(blank=True, null=True)
    response_time_ms = models.IntegerField(
        blank=True,
        null=True,
        help_text="Response time in milliseconds"
    )

    # Additional data
    metadata = models.JSONField(blank=True, null=True)

    class Meta:
        verbose_name = "Session Activity"
        verbose_name_plural = "Session Activities"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['session', 'created_at']),
            models.Index(fields=['activity_type', 'created_at']),
        ]

    def __str__(self):
        return f"{self.activity_type} - {self.activity_description}"


class LoginAttempt(BaseModel):
    """
    Track login attempts for security monitoring
    """
    # User information
    email = models.EmailField(db_index=True)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='login_attempts'
    )

    # Attempt details
    success = models.BooleanField(default=False, db_index=True)
    failure_reason = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        choices=(
            ('INVALID_PASSWORD', 'Invalid Password'),
            ('USER_NOT_FOUND', 'User Not Found'),
            ('ACCOUNT_LOCKED', 'Account Locked'),
            ('ACCOUNT_INACTIVE', 'Account Inactive'),
            ('2FA_REQUIRED', '2FA Required'),
            ('2FA_FAILED', '2FA Failed'),
            ('IP_BLOCKED', 'IP Blocked'),
        )
    )

    # Device and location
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)

    # Security flags
    is_suspicious = models.BooleanField(default=False)
    is_blocked = models.BooleanField(default=False)
    blocked_until = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Login Attempt"
        verbose_name_plural = "Login Attempts"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', 'success']),
            models.Index(fields=['ip_address', 'created_at']),
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        status = "Success" if self.success else "Failed"
        return f"{self.email} - {status} ({self.ip_address})"


class DeviceFingerprint(BaseModel):
    """
    Store device fingerprints for trusted device tracking
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='device_fingerprints'
    )

    # Fingerprint data
    fingerprint_hash = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        help_text="SHA256 hash of device characteristics"
    )
    fingerprint_data = models.JSONField(
        help_text="Device characteristics used for fingerprinting"
    )

    # Device info
    device_name = models.CharField(max_length=200, blank=True, null=True)
    is_trusted = models.BooleanField(default=False)
    last_seen_at = models.DateTimeField(auto_now=True)
    first_seen_at = models.DateTimeField(auto_now_add=True)

    # Usage tracking
    login_count = models.IntegerField(default=0)
    last_ip = models.GenericIPAddressField(blank=True, null=True)

    class Meta:
        verbose_name = "Device Fingerprint"
        verbose_name_plural = "Device Fingerprints"
        ordering = ['-last_seen_at']
        indexes = [
            models.Index(fields=['user', 'is_trusted']),
            models.Index(fields=['fingerprint_hash']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.device_name or 'Unknown Device'}"

    def mark_trusted(self):
        """Mark this device as trusted"""
        self.is_trusted = True
        self.save(update_fields=['is_trusted', 'updated_at'])

    def increment_login_count(self):
        """Increment the login count"""
        self.login_count += 1
        self.save(update_fields=['login_count', 'updated_at'])
