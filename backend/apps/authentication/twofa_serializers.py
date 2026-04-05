"""
Serializers for Two-Factor Authentication
"""
from rest_framework import serializers
from .twofa_models import TwoFactorAuth, TwoFactorVerification, TrustedDevice
from .serializers import UserSerializer


class TwoFactorAuthSerializer(serializers.ModelSerializer):
    """Serializer for TwoFactorAuth"""
    user = UserSerializer(read_only=True)
    qr_code = serializers.SerializerMethodField()
    provisioning_uri = serializers.SerializerMethodField()

    class Meta:
        model = TwoFactorAuth
        fields = [
            'id', 'user', 'is_enabled', 'is_verified',
            'enabled_at', 'last_verified_at', 'backup_codes',
            'qr_code', 'provisioning_uri', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'is_verified', 'enabled_at',
            'last_verified_at', 'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'backup_codes': {'write_only': True}
        }

    def get_qr_code(self, obj):
        """Get QR code only if not enabled yet"""
        if not obj.is_enabled:
            return obj.get_qr_code()
        return None

    def get_provisioning_uri(self, obj):
        """Get provisioning URI only if not enabled yet"""
        if not obj.is_enabled:
            return obj.get_provisioning_uri()
        return None


class TwoFactorSetupSerializer(serializers.Serializer):
    """Serializer for 2FA setup response"""
    secret_key = serializers.CharField(read_only=True)
    qr_code = serializers.CharField(read_only=True)
    provisioning_uri = serializers.CharField(read_only=True)
    backup_codes = serializers.ListField(
        child=serializers.CharField(),
        read_only=True
    )


class TwoFactorVerifySerializer(serializers.Serializer):
    """Serializer for verifying 2FA code"""
    code = serializers.CharField(
        min_length=6,
        max_length=6,
        help_text="6-digit TOTP code"
    )

    def validate_code(self, value):
        """Validate code format"""
        if not value.isdigit():
            raise serializers.ValidationError("Code must contain only digits")
        return value


class TwoFactorBackupCodeSerializer(serializers.Serializer):
    """Serializer for using backup code"""
    backup_code = serializers.CharField(
        help_text="Backup code in format XXXX-XXXX"
    )


class TwoFactorVerificationSerializer(serializers.ModelSerializer):
    """Serializer for TwoFactorVerification"""
    user = UserSerializer(read_only=True)
    method_display = serializers.CharField(
        source='get_method_display',
        read_only=True
    )
    failure_reason_display = serializers.CharField(
        source='get_failure_reason_display',
        read_only=True
    )

    class Meta:
        model = TwoFactorVerification
        fields = [
            'id', 'user', 'success', 'method', 'method_display',
            'ip_address', 'location', 'failure_reason',
            'failure_reason_display', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class TrustedDeviceSerializer(serializers.ModelSerializer):
    """Serializer for TrustedDevice"""
    user = UserSerializer(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = TrustedDevice
        fields = [
            'id', 'user', 'device_fingerprint', 'device_name',
            'ip_address', 'browser', 'operating_system',
            'is_active', 'is_expired', 'expires_at',
            'last_used_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'last_used_at', 'created_at', 'updated_at'
        ]
