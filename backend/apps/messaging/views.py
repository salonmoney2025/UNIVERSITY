"""
Messaging System Views
Real-time chat API endpoints with WebSocket support
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, F, Count
from django.utils import timezone
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from .models import (
    Conversation, Message, MessageRead, UserPresence,
    MessageNotification, ConversationMute, TypingIndicator
)
from .serializers import (
    ConversationListSerializer, ConversationDetailSerializer,
    MessageSerializer, UserPresenceSerializer, MessageNotificationSerializer
)
from apps.authentication.models import User


class MessagePagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100


class ConversationViewSet(viewsets.ModelViewSet):
    """
    Conversation CRUD operations
    - List all conversations
    - Create new conversation (direct or group)
    - Get conversation details
    - Add/remove participants
    - Archive/unarchive
    - Mute/unmute notifications
    """
    permission_classes = [IsAuthenticated]
    pagination_class = MessagePagination

    def get_queryset(self):
        """Get conversations for current user"""
        user = self.request.user
        return Conversation.objects.filter(
            participants=user
        ).annotate(
            unread_count=Count(
                'messages',
                filter=Q(messages__read_by__user_id__isnull=True)
            )
        ).select_related(
            'created_by'
        ).prefetch_related(
            'participants', 'messages'
        ).order_by('-last_message_at')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ConversationDetailSerializer
        return ConversationListSerializer

    @extend_schema(
        description="Create a new conversation (direct message or group chat)"
    )
    def create(self, request, *args, **kwargs):
        """Create new conversation"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        conversation_type = request.data.get('type', 'direct')
        participant_ids = request.data.get('participant_ids', [])

        # Ensure current user is included
        if request.user.id not in participant_ids:
            participant_ids.append(request.user.id)

        # For direct messages, limit to 2 participants
        if conversation_type == 'direct' and len(participant_ids) > 2:
            return Response(
                {'error': 'Direct messages can only have 2 participants'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if direct message already exists
        if conversation_type == 'direct':
            existing = Conversation.objects.filter(
                type='direct',
                participants__in=[request.user.id]
            ).annotate(
                participant_count=Count('participants')
            ).filter(participant_count=2)

            for conv in existing:
                if set(conv.participants.values_list('id', flat=True)) == set(participant_ids):
                    return Response(
                        ConversationListSerializer(conv, context={'request': request}).data,
                        status=status.HTTP_201_CREATED
                    )

        # Create conversation
        conversation = Conversation.objects.create(
            type=conversation_type,
            name=request.data.get('name', ''),
            description=request.data.get('description', ''),
            created_by=request.user
        )

        # Add participants
        participants = User.objects.filter(id__in=participant_ids)
        conversation.participants.set(participants)

        return Response(
            ConversationListSerializer(conversation, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    @extend_schema(description="Add participant(s) to conversation")
    def add_participants(self, request, pk=None):
        """Add users to conversation"""
        conversation = self.get_object()

        # Check permission (only creator or admins can add)
        if conversation.created_by_id != request.user.id:
            return Response(
                {'error': 'Only conversation creator can add participants'},
                status=status.HTTP_403_FORBIDDEN
            )

        participant_ids = request.data.get('participant_ids', [])
        if not participant_ids:
            return Response(
                {'error': 'participant_ids required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        users = User.objects.filter(id__in=participant_ids)
        conversation.participants.add(*users)

        return Response({
            'status': 'participants added',
            'count': len(participant_ids)
        })

    @action(detail=True, methods=['post'])
    @extend_schema(description="Remove participant from conversation")
    def remove_participant(self, request, pk=None):
        """Remove user from conversation"""
        conversation = self.get_object()

        if conversation.created_by_id != request.user.id:
            return Response(
                {'error': 'Only conversation creator can remove participants'},
                status=status.HTTP_403_FORBIDDEN
            )

        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = get_object_or_404(User, id=user_id)
        conversation.participants.remove(user)

        return Response({'status': 'participant removed'})

    @action(detail=True, methods=['post'])
    @extend_schema(description="Archive conversation")
    def archive(self, request, pk=None):
        """Archive conversation"""
        conversation = self.get_object()
        conversation.is_archived = True
        conversation.save()
        return Response({'status': 'conversation archived'})

    @action(detail=True, methods=['post'])
    @extend_schema(description="Unarchive conversation")
    def unarchive(self, request, pk=None):
        """Unarchive conversation"""
        conversation = self.get_object()
        conversation.is_archived = False
        conversation.save()
        return Response({'status': 'conversation unarchived'})

    @action(detail=True, methods=['post'])
    @extend_schema(description="Mute conversation notifications")
    def mute(self, request, pk=None):
        """Mute conversation notifications"""
        conversation = self.get_object()
        muted_until = request.data.get('muted_until')

        ConversationMute.objects.get_or_create(
            conversation=conversation,
            user=request.user,
            defaults={'muted_until': muted_until}
        )

        return Response({'status': 'conversation muted'})

    @action(detail=True, methods=['post'])
    @extend_schema(description="Unmute conversation")
    def unmute(self, request, pk=None):
        """Unmute conversation"""
        conversation = self.get_object()
        ConversationMute.objects.filter(
            conversation=conversation,
            user=request.user
        ).delete()

        return Response({'status': 'conversation unmuted'})

    @action(detail=True, methods=['get'])
    @extend_schema(description="Get conversation participants")
    def participants(self, request, pk=None):
        """Get all participants in conversation"""
        conversation = self.get_object()
        from .serializers import UserBasicSerializer
        serializer = UserBasicSerializer(
            conversation.participants.all(),
            many=True
        )
        return Response(serializer.data)


class MessageViewSet(viewsets.ModelViewSet):
    """
    Message CRUD operations
    - Send message
    - Edit message
    - Delete message (soft delete)
    - React to message
    - Get message history
    - Mark as read
    """
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer
    pagination_class = MessagePagination

    def get_queryset(self):
        """Get messages for conversations user is in"""
        user = self.request.user
        conversation_id = self.request.query_params.get('conversation_id')

        if conversation_id:
            return Message.objects.filter(
                conversation_id=conversation_id,
                conversation__participants=user,
                is_deleted=False
            ).select_related('sender', 'reply_to').prefetch_related('read_by')

        return Message.objects.filter(
            conversation__participants=user,
            is_deleted=False
        ).select_related('sender').prefetch_related('read_by')

    @extend_schema(description="Send new message")
    def create(self, request, *args, **kwargs):
        """Send message"""
        conversation_id = request.data.get('conversation_id')
        content = request.data.get('content', '').strip()

        if not conversation_id:
            return Response(
                {'error': 'conversation_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not content and not request.FILES.get('file'):
            return Response(
                {'error': 'content or file required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        conversation = get_object_or_404(Conversation, id=conversation_id)

        # Check if user is participant
        if request.user not in conversation.participants.all():
            return Response(
                {'error': 'Not a participant in this conversation'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Create message
        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content,
            file=request.FILES.get('file')
        )

        # Update conversation last message time
        conversation.last_message_at = timezone.now()
        conversation.save(update_fields=['last_message_at'])

        # Create notifications for other participants
        for participant in conversation.participants.exclude(id=request.user.id):
            MessageNotification.objects.create(
                recipient=participant,
                conversation=conversation,
                message=message,
                sender=request.user
            )

        # Trigger WebSocket event (will be handled by consumer)
        return Response(
            MessageSerializer(message, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['patch'])
    @extend_schema(description="Edit message")
    def edit(self, request, pk=None):
        """Edit message"""
        message = self.get_object()

        if message.sender_id != request.user.id:
            return Response(
                {'error': 'Can only edit your own messages'},
                status=status.HTTP_403_FORBIDDEN
            )

        content = request.data.get('content', '').strip()
        if not content:
            return Response(
                {'error': 'content required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        message.content = content
        message.is_edited = True
        message.edited_at = timezone.now()
        message.save()

        return Response(MessageSerializer(message, context={'request': request}).data)

    @action(detail=True, methods=['delete'])
    @extend_schema(description="Delete message (soft delete)")
    def soft_delete(self, request, pk=None):
        """Soft delete message"""
        message = self.get_object()

        if message.sender_id != request.user.id:
            return Response(
                {'error': 'Can only delete your own messages'},
                status=status.HTTP_403_FORBIDDEN
            )

        message.is_deleted = True
        message.save(update_fields=['is_deleted'])

        return Response({'status': 'message deleted'})

    @action(detail=True, methods=['post'])
    @extend_schema(description="React to message with emoji")
    def react(self, request, pk=None):
        """Add reaction to message"""
        message = self.get_object()
        emoji = request.data.get('emoji')

        if not emoji:
            return Response(
                {'error': 'emoji required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get current reactions
        reactions = message.reactions or {}
        reactions[emoji] = reactions.get(emoji, 0) + 1
        message.reactions = reactions
        message.save(update_fields=['reactions'])

        return Response({
            'status': 'reaction added',
            'reactions': message.reactions
        })

    @action(detail=True, methods=['post'])
    @extend_schema(description="Mark message as read")
    def mark_as_read(self, request, pk=None):
        """Mark message as read"""
        message = self.get_object()

        MessageRead.objects.get_or_create(
            message=message,
            user=request.user
        )

        return Response({'status': 'message marked as read'})

    @action(detail=False, methods=['post'])
    @extend_schema(description="Mark all messages in conversation as read")
    def mark_conversation_as_read(self, request):
        """Mark all messages in conversation as read"""
        conversation_id = request.data.get('conversation_id')

        if not conversation_id:
            return Response(
                {'error': 'conversation_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        conversation = get_object_or_404(Conversation, id=conversation_id)

        if request.user not in conversation.participants.all():
            return Response(
                {'error': 'Not a participant'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get unread messages
        unread_messages = conversation.messages.exclude(
            read_by__user=request.user
        )

        # Mark all as read
        for message in unread_messages:
            MessageRead.objects.get_or_create(
                message=message,
                user=request.user
            )

        return Response({
            'status': 'messages marked as read',
            'count': unread_messages.count()
        })


class UserPresenceViewSet(viewsets.ViewSet):
    """
    User presence and online status
    - Get online users
    - Set user online/offline
    - Track current conversation
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(description="Get list of online users")
    def list(self, request):
        """Get online users"""
        # Get users online in last 5 minutes
        presence = UserPresence.objects.filter(
            is_online=True,
            last_seen__gte=timezone.now() - timezone.timedelta(minutes=5)
        ).select_related('user')

        serializer = UserPresenceSerializer(presence, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    @extend_schema(description="Set user as online")
    def set_online(self, request):
        """Mark user as online"""
        presence, created = UserPresence.objects.get_or_create(
            user=request.user
        )
        presence.is_online = True
        presence.last_seen = timezone.now()

        # Set current conversation if provided
        conversation_id = request.data.get('conversation_id')
        if conversation_id:
            conversation = get_object_or_404(Conversation, id=conversation_id)
            if request.user in conversation.participants.all():
                presence.current_conversation = conversation

        presence.save()

        return Response({
            'status': 'online',
            'user': UserPresenceSerializer(presence).data
        })

    @action(detail=False, methods=['post'])
    @extend_schema(description="Set user as offline")
    def set_offline(self, request):
        """Mark user as offline"""
        presence, created = UserPresence.objects.get_or_create(
            user=request.user
        )
        presence.is_online = False
        presence.current_conversation = None
        presence.save()

        return Response({'status': 'offline'})

    @action(detail=False, methods=['get'])
    @extend_schema(description="Get typing users in conversation")
    def typing_users(self, request):
        """Get users currently typing in conversation"""
        conversation_id = request.query_params.get('conversation_id')

        if not conversation_id:
            return Response(
                {'error': 'conversation_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get typing indicators (valid for 3 seconds)
        typing = TypingIndicator.objects.filter(
            conversation_id=conversation_id,
            expires_at__gt=timezone.now()
        ).select_related('user')

        from .serializers import UserBasicSerializer
        users = [ti.user for ti in typing]
        serializer = UserBasicSerializer(users, many=True)

        return Response({
            'users': serializer.data,
            'count': len(users)
        })

    @action(detail=False, methods=['post'])
    @extend_schema(description="Indicate user is typing")
    def typing(self, request):
        """Set typing indicator"""
        conversation_id = request.data.get('conversation_id')

        if not conversation_id:
            return Response(
                {'error': 'conversation_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        conversation = get_object_or_404(Conversation, id=conversation_id)

        if request.user not in conversation.participants.all():
            return Response(
                {'error': 'Not a participant'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Create/update typing indicator (expires in 3 seconds)
        TypingIndicator.objects.update_or_create(
            conversation=conversation,
            user=request.user,
            defaults={'expires_at': timezone.now() + timezone.timedelta(seconds=3)}
        )

        return Response({'status': 'typing indicator set'})


class MessageNotificationViewSet(viewsets.ModelViewSet):
    """
    Message notifications
    - Get unread notifications
    - Mark notification as read
    - Clear all notifications
    """
    permission_classes = [IsAuthenticated]
    serializer_class = MessageNotificationSerializer
    pagination_class = MessagePagination

    def get_queryset(self):
        """Get notifications for current user"""
        return MessageNotification.objects.filter(
            recipient=self.request.user
        ).select_related('sender', 'conversation').order_by('-created_at')

    @action(detail=False, methods=['get'])
    @extend_schema(description="Get unread notification count")
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = MessageNotification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()

        return Response({'unread_count': count})

    @action(detail=True, methods=['post'])
    @extend_schema(description="Mark notification as read")
    def mark_as_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()

        return Response({'status': 'notification marked as read'})

    @action(detail=False, methods=['post'])
    @extend_schema(description="Mark all notifications as read")
    def mark_all_as_read(self, request):
        """Mark all notifications as read"""
        count = MessageNotification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )

        return Response({
            'status': 'all notifications marked as read',
            'count': count
        })

    @action(detail=False, methods=['delete'])
    @extend_schema(description="Delete all notifications")
    def clear_all(self, request):
        """Clear all notifications"""
        count, _ = MessageNotification.objects.filter(
            recipient=request.user
        ).delete()

        return Response({
            'status': 'all notifications cleared',
            'count': count
        })
