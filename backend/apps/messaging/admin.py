"""
Django Admin Configuration for Messaging
"""
from django.contrib import admin
from .models import (
    Conversation, ConversationMute, Message, MessageRead,
    TypingIndicator, UserPresence, MessageNotification
)


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'name', 'created_by', 'last_message_at', 'participant_count', 'is_archived')
    list_filter = ('type', 'is_archived', 'created_at')
    search_fields = ('name', 'description', 'created_by__email')
    readonly_fields = ('created_at', 'updated_at', 'last_message_at')
    filter_horizontal = ('participants',)

    fieldsets = (
        ('Info', {
            'fields': ('type', 'name', 'description', 'created_by')
        }),
        ('Participants', {
            'fields': ('participants',)
        }),
        ('Settings', {
            'fields': ('is_archived',)
        }),
        ('Activity', {
            'fields': ('last_message_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def participant_count(self, obj):
        return obj.participants.count()
    participant_count.short_description = 'Participants'


@admin.register(ConversationMute)
class ConversationMuteAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'user', 'muted_until', 'is_active')
    list_filter = ('muted_until', 'created_at')
    search_fields = ('conversation__name', 'user__email')
    readonly_fields = ('created_at', 'updated_at')

    def is_active(self, obj):
        from django.utils import timezone
        if obj.muted_until is None:
            return True
        return obj.muted_until > timezone.now()
    is_active.short_description = 'Muted'
    is_active.boolean = True


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'sender', 'content_preview', 'is_edited', 'is_deleted', 'created_at', 'read_count')
    list_filter = ('is_edited', 'is_deleted', 'created_at')
    search_fields = ('sender__email', 'content', 'conversation__name')
    readonly_fields = ('sender', 'created_at', 'updated_at', 'read_count', 'reactions_display')
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Message', {
            'fields': ('conversation', 'sender', 'content', 'file', 'file_type')
        }),
        ('Metadata', {
            'fields': ('is_edited', 'edited_at', 'is_deleted', 'reply_to')
        }),
        ('Reactions', {
            'fields': ('reactions_display', 'reactions'),
            'classes': ('collapse',)
        }),
        ('Activity', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def content_preview(self, obj):
        return obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Content'

    def read_count(self, obj):
        return obj.read_by.count()
    read_count.short_description = 'Read by'

    def reactions_display(self, obj):
        if not obj.reactions:
            return '(none)'
        return ', '.join([f"{emoji} ({count})" for emoji, count in obj.reactions.items()])
    reactions_display.short_description = 'Reactions'


@admin.register(MessageRead)
class MessageReadAdmin(admin.ModelAdmin):
    list_display = ('message', 'user', 'read_at')
    list_filter = ('read_at',)
    search_fields = ('message__id', 'user__email')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Read Status', {
            'fields': ('message', 'user', 'read_at')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(TypingIndicator)
class TypingIndicatorAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'user', 'started_at', 'expires_at', 'is_active')
    list_filter = ('expires_at',)
    search_fields = ('conversation__name', 'user__email')
    readonly_fields = ('created_at', 'updated_at')

    def is_active(self, obj):
        from django.utils import timezone
        return obj.expires_at > timezone.now()
    is_active.short_description = 'Active'
    is_active.boolean = True


@admin.register(UserPresence)
class UserPresenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_online', 'last_seen', 'current_conversation')
    list_filter = ('is_online', 'last_seen')
    search_fields = ('user__email',)
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Status', {
            'fields': ('is_online', 'last_seen', 'current_conversation')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(MessageNotification)
class MessageNotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'sender', 'conversation', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('recipient__email', 'sender__email', 'conversation__name')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Notification', {
            'fields': ('recipient', 'sender', 'conversation', 'message')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
