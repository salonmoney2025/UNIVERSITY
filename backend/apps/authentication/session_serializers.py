"""
Serializers for Session Management
"""
from rest_framework import serializers
from .session_models import (
    UserSession, SessionActivity, LoginAttempt, DeviceFingerprint
)
from .serializers import UserSerializer


class UserSessionSerializer(serializers.ModelSerializer):
    """Serializer for UserSession"""
    user = UserSerializer(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    is_current = serializers.BooleanField(read_only=True)
    login_method_display = serializers.CharField(
        source='get_login_method_display',
        read_only=True
    )

    class Meta:
        model = UserSession
        fields = [
            'id', 'user', 'device_type', 'device_name', 'browser',
            'browser_version', 'operating_system', 'os_version',
            'ip_address', 'country', 'city', 'latitude', 'longitude',
            'is_mobile', 'is_active', 'last_activity', 'expires_at',
            'login_method', 'login_method_display', 'login_at',
            'logout_at', 'is_suspicious', 'is_expired', 'is_current',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'ip_address', 'last_activity', 'login_at',
            'logout_at', 'created_at', 'updated_at'
        ]


class SessionActivitySerializer(serializers.ModelSerializer):
    """Serializer for SessionActivity"""
    activity_type_display = serializers.CharField(
        source='get_activity_type_display',
        read_only=True
    )

    class Meta:
        model = SessionActivity
        fields = [
            'id', 'session', 'activity_type', 'activity_type_display',
            'activity_description', 'url', 'http_method', 'ip_address',
            'status_code', 'response_time_ms', 'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class LoginAttemptSerializer(serializers.ModelSerializer):
    """Serializer for LoginAttempt"""
    user = UserSerializer(read_only=True)
    failure_reason_display = serializers.CharField(
        source='get_failure_reason_display',
        read_only=True
    )

    class Meta:
        model = LoginAttempt
        fields = [
            'id', 'email', 'user', 'success', 'failure_reason',
            'failure_reason_display', 'ip_address', 'country', 'city',
            'is_suspicious', 'is_blocked', 'blocked_until', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class DeviceFingerprintSerializer(serializers.ModelSerializer):
    """Serializer for DeviceFingerprint"""
    user = UserSerializer(read_only=True)

    class Meta:
        model = DeviceFingerprint
        fields = [
            'id', 'user', 'fingerprint_hash', 'device_name',
            'is_trusted', 'last_seen_at', 'first_seen_at',
            'login_count', 'last_ip', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'fingerprint_hash', 'last_seen_at',
            'first_seen_at', 'login_count', 'last_ip',
            'created_at', 'updated_at'
        ]


class SessionSummarySerializer(serializers.Serializer):
    """Serializer for session summary statistics"""
    total_sessions = serializers.IntegerField()
    active_sessions = serializers.IntegerField()
    expired_sessions = serializers.IntegerField()
    suspicious_sessions = serializers.IntegerField()
    unique_devices = serializers.IntegerField()
    unique_locations = serializers.IntegerField()
    last_login = serializers.DateTimeField()
    total_login_attempts = serializers.IntegerField()
    failed_login_attempts = serializers.IntegerField()
