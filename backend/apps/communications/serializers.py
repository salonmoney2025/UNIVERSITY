from rest_framework import serializers
from .models import Notification, SMSLog, EmailLog


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Notification model
    """
    recipient_email = serializers.EmailField(source='recipient_user.email', read_only=True)
    recipient_name = serializers.CharField(source='recipient_user.get_full_name', read_only=True)
    sender_email = serializers.EmailField(source='sender_user.email', read_only=True, allow_null=True)
    sender_name = serializers.CharField(source='sender_user.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'recipient_user', 'recipient_email', 'recipient_name',
            'sender_user', 'sender_email', 'sender_name', 'title',
            'message', 'notification_type', 'priority', 'is_read',
            'sent_at', 'read_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'sent_at', 'read_at', 'created_at', 'updated_at']


class SMSLogSerializer(serializers.ModelSerializer):
    """
    Serializer for SMSLog model
    """
    class Meta:
        model = SMSLog
        fields = [
            'id', 'recipient_phone', 'message', 'status',
            'sent_at', 'gateway_response', 'cost',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'sent_at', 'created_at', 'updated_at']


class EmailLogSerializer(serializers.ModelSerializer):
    """
    Serializer for EmailLog model
    """
    class Meta:
        model = EmailLog
        fields = [
            'id', 'recipient_email', 'subject', 'body', 'status',
            'sent_at', 'opened_at', 'clicked_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'sent_at', 'opened_at', 'clicked_at', 'created_at', 'updated_at']
