"""
Messaging System Serializers
"""
from rest_framework import serializers
from .models import Conversation, Message, MessageRead, UserPresence, MessageNotification
from apps.authentication.models import User


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'avatar']
        read_only_fields = fields


class MessageSerializer(serializers.ModelSerializer):
    sender = UserBasicSerializer(read_only=True)
    read_by_count = serializers.SerializerMethodField()
    is_read = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'content', 'file', 'file_type',
            'is_edited', 'edited_at', 'is_deleted', 'reactions',
            'reply_to', 'created_at', 'read_by_count', 'is_read'
        ]
        read_only_fields = ['id', 'sender', 'created_at', 'read_by_count']

    def get_read_by_count(self, obj):
        return obj.read_by.count()

    def get_is_read(self, obj):
        request = self.context.get('request')
        if request:
            return MessageRead.objects.filter(message=obj, user=request.user).exists()
        return False


class ConversationListSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    participants_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'type', 'name', 'participants_count',
            'last_message', 'last_message_at', 'unread_count',
            'is_archived', 'created_at'
        ]
        read_only_fields = fields

    def get_last_message(self, obj):
        last_msg = obj.messages.first()
        return MessageSerializer(last_msg).data if last_msg else None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request:
            return obj.messages.exclude(
                read_by__user=request.user
            ).count()
        return 0

    def get_participants_count(self, obj):
        return obj.participants.count()


class ConversationDetailSerializer(serializers.ModelSerializer):
    participants = UserBasicSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    created_by = UserBasicSerializer(read_only=True)

    class Meta:
        model = Conversation
        fields = [
            'id', 'type', 'name', 'description', 'participants',
            'created_by', 'messages', 'is_archived', 'created_at'
        ]
        read_only_fields = fields


class UserPresenceSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = UserPresence
        fields = ['user', 'is_online', 'last_seen', 'current_conversation']
        read_only_fields = fields


class MessageNotificationSerializer(serializers.ModelSerializer):
    sender = UserBasicSerializer(read_only=True)
    conversation = ConversationListSerializer(read_only=True)

    class Meta:
        model = MessageNotification
        fields = [
            'id', 'conversation', 'sender', 'is_read',
            'read_at', 'created_at'
        ]
        read_only_fields = fields
