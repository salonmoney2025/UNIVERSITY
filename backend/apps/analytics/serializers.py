from rest_framework import serializers
from .models import AuditLog, SystemMetric


class AuditLogSerializer(serializers.ModelSerializer):
    """
    Serializer for AuditLog model
    """
    user_email = serializers.EmailField(source='user.email', read_only=True, allow_null=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_email', 'user_name', 'action',
            'model_name', 'object_id', 'changes', 'ip_address',
            'user_agent', 'timestamp', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'timestamp', 'created_at', 'updated_at']


class SystemMetricSerializer(serializers.ModelSerializer):
    """
    Serializer for SystemMetric model
    """
    campus_name = serializers.CharField(source='campus.name', read_only=True, allow_null=True)

    class Meta:
        model = SystemMetric
        fields = [
            'id', 'metric_name', 'metric_value', 'metric_type',
            'campus', 'campus_name', 'recorded_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'recorded_at', 'created_at', 'updated_at']
