"""
Messaging System Models
Real-time chat and messaging for University LMS
"""
from django.db import models
from django.utils import timezone
from apps.authentication.models import BaseModel, User


class Conversation(BaseModel):
    """Direct message or group chat conversation"""
    # Type
    CONVERSATION_TYPE = [
        ('direct', 'Direct Message'),
        ('group', 'Group Chat'),
    ]
    type = models.CharField(max_length=20, choices=CONVERSATION_TYPE, default='direct')

    # Names/titles
    name = models.CharField(max_length=255, blank=True)  # For group chats
    description = models.TextField(blank=True)

    # Participants
    participants = models.ManyToManyField(User, related_name='conversations')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_conversations')

    # Settings
    is_archived = models.BooleanField(default=False, db_index=True)
    is_muted = models.ManyToManyField(User, through='ConversationMute', related_name='muted_conversations')

    # Activity
    last_message_at = models.DateTimeField(null=True, blank=True, db_index=True)
    unread_count = models.IntegerField(default=0)

    class Meta:
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'
        ordering = ['-last_message_at']
        indexes = [
            models.Index(fields=['is_archived', '-last_message_at']),
            models.Index(fields=['created_by']),
        ]

    def __str__(self):
        if self.type == 'direct' and self.participants.count() == 2:
            other = self.participants.exclude(id=self.created_by_id).first()
            return f"Direct message with {other.email if other else 'unknown'}"
        return self.name or f"Conversation #{self.id}"

    @property
    def other_participant(self):
        """Get other participant in direct message"""
        if self.type == 'direct':
            return self.participants.exclude(id=self.created_by_id).first()
        return None


class ConversationMute(BaseModel):
    """Muted conversations"""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    muted_until = models.DateTimeField(null=True, blank=True)  # Null = muted forever

    class Meta:
        unique_together = ['conversation', 'user']


class Message(BaseModel):
    """Chat messages"""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')

    # Content
    content = models.TextField()
    file = models.FileField(upload_to='messages/%Y/%m/%d/', null=True, blank=True)
    file_type = models.CharField(max_length=10, blank=True)

    # Message metadata
    is_edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)  # Soft delete

    # Reactions
    reactions = models.JSONField(default=dict)  # {"emoji": count, ...}

    # Reply to message
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')

    # Typing indicator
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
            models.Index(fields=['sender']),
        ]

    def __str__(self):
        preview = self.content[:50] + '...' if len(self.content) > 50 else self.content
        return f"{self.sender.email}: {preview}"


class MessageRead(BaseModel):
    """Track message read status"""
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='read_by')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['message', 'user']


class TypingIndicator(BaseModel):
    """Track who is typing"""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()  # Auto-expire after 3 seconds

    class Meta:
        unique_together = ['conversation', 'user']


class UserPresence(BaseModel):
    """Track user online status"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='presence')
    is_online = models.BooleanField(default=False, db_index=True)
    last_seen = models.DateTimeField(auto_now=True)
    current_conversation = models.ForeignKey(
        Conversation, on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        verbose_name = 'User Presence'
        verbose_name_plural = 'User Presences'

    def __str__(self):
        status = 'Online' if self.is_online else f'Last seen {self.last_seen}'
        return f"{self.user.email} - {status}"


class MessageNotification(BaseModel):
    """Notification for new messages"""
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_notifications')
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    message = models.ForeignKey(Message, on_delete=models.CASCADE, null=True, blank=True)
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_notifications')

    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Message Notification'
        verbose_name_plural = 'Message Notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
        ]

    def __str__(self):
        return f"Notification for {self.recipient.email} from {self.sender.email if self.sender else 'system'}"
