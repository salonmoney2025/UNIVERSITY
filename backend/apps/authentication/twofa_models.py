"""
Two-Factor Authentication Models
TOTP (Time-based One-Time Password) implementation
"""
import pyotp
import qrcode
import io
import base64
from django.db import models
from django.utils import timezone
from .models import BaseModel, User


class TwoFactorAuth(BaseModel):
    """
    Store 2FA settings for users
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='two_factor_auth'
    )

    # TOTP Secret
    secret_key = models.CharField(
        max_length=32,
        help_text="Base32 encoded secret key for TOTP"
    )

    # Status
    is_enabled = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)

    # Backup codes
    backup_codes = models.JSONField(
        default=list,
        help_text="List of one-time backup codes"
    )

    # Timestamps
    enabled_at = models.DateTimeField(null=True, blank=True)
    last_verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Two-Factor Authentication"
        verbose_name_plural = "Two-Factor Authentications"

    def __str__(self):
        return f"2FA for {self.user.email}"

    @classmethod
    def create_for_user(cls, user):
        """Create 2FA settings for a user"""
        secret = pyotp.random_base32()
        backup_codes = cls.generate_backup_codes()

        return cls.objects.create(
            user=user,
            secret_key=secret,
            backup_codes=backup_codes
        )

    @staticmethod
    def generate_backup_codes(count=8):
        """Generate backup codes"""
        import secrets
        return [
            f"{secrets.randbelow(10000):04d}-{secrets.randbelow(10000):04d}"
            for _ in range(count)
        ]

    def get_totp(self):
        """Get TOTP instance"""
        return pyotp.TOTP(self.secret_key)

    def get_provisioning_uri(self):
        """Get provisioning URI for QR code"""
        totp = self.get_totp()
        return totp.provisioning_uri(
            name=self.user.email,
            issuer_name="EBKUST University"
        )

    def get_qr_code(self):
        """Generate QR code as base64 image"""
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(self.get_provisioning_uri())
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        img_base64 = base64.b64encode(buffer.getvalue()).decode()

        return f"data:image/png;base64,{img_base64}"

    def verify_token(self, token):
        """Verify TOTP token"""
        totp = self.get_totp()
        # Allow 1 interval window (30 seconds before/after)
        return totp.verify(token, valid_window=1)

    def use_backup_code(self, code):
        """Use a backup code (one-time use)"""
        if code in self.backup_codes:
            self.backup_codes.remove(code)
            self.save(update_fields=['backup_codes', 'updated_at'])
            return True
        return False

    def enable(self):
        """Enable 2FA"""
        self.is_enabled = True
        self.is_verified = True
        self.enabled_at = timezone.now()
        self.save(update_fields=['is_enabled', 'is_verified', 'enabled_at', 'updated_at'])

    def disable(self):
        """Disable 2FA"""
        self.is_enabled = False
        self.save(update_fields=['is_enabled', 'updated_at'])

    def regenerate_backup_codes(self):
        """Regenerate backup codes"""
        self.backup_codes = self.generate_backup_codes()
        self.save(update_fields=['backup_codes', 'updated_at'])
        return self.backup_codes


class TwoFactorVerification(BaseModel):
    """
    Log of 2FA verification attempts
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='twofa_verifications'
    )

    # Verification details
    success = models.BooleanField(default=False)
    method = models.CharField(
        max_length=20,
        choices=(
            ('TOTP', 'TOTP Code'),
            ('BACKUP', 'Backup Code'),
        )
    )

    # Security tracking
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=200, blank=True, null=True)

    # Failure tracking
    failure_reason = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        choices=(
            ('INVALID_CODE', 'Invalid Code'),
            ('EXPIRED_CODE', 'Expired Code'),
            ('TOO_MANY_ATTEMPTS', 'Too Many Attempts'),
            ('DISABLED', '2FA Disabled'),
        )
    )

    class Meta:
        verbose_name = "2FA Verification"
        verbose_name_plural = "2FA Verifications"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'success']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        status = "Success" if self.success else "Failed"
        return f"{self.user.email} - {status} ({self.method})"


class TrustedDevice(BaseModel):
    """
    Devices that don't require 2FA
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='trusted_devices'
    )

    # Device identification
    device_fingerprint = models.CharField(
        max_length=64,
        db_index=True,
        help_text="Hash of device characteristics"
    )
    device_name = models.CharField(max_length=200)

    # Device info
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    browser = models.CharField(max_length=100, blank=True, null=True)
    operating_system = models.CharField(max_length=100, blank=True, null=True)

    # Trust settings
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField()
    last_used_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Trusted Device"
        verbose_name_plural = "Trusted Devices"
        ordering = ['-last_used_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['device_fingerprint']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.device_name}"

    @property
    def is_expired(self):
        """Check if trust has expired"""
        return timezone.now() > self.expires_at

    def revoke(self):
        """Revoke trust from this device"""
        self.is_active = False
        self.save(update_fields=['is_active', 'updated_at'])
