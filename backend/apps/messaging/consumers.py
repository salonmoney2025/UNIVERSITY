"""
WebSocket Consumers for Real-time Messaging
Handles real-time message delivery, typing indicators, and presence
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import (
    Conversation, Message, UserPresence, MessageNotification,
    TypingIndicator, MessageRead
)


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time chat
    Handles:
    - Message delivery
    - Typing indicators
    - User presence
    - Read receipts
    """

    async def connect(self):
        """Handle WebSocket connection"""
        self.user = self.scope["user"]
        self.conversation_id = self.scope['url_route']['kwargs'].get('conversation_id')
        self.room_group_name = f'chat_{self.conversation_id}'

        # Verify user is participant
        is_participant = await self.check_participant()

        if not is_participant:
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Set user as online
        await self.set_user_online()

        # Notify others user joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_join',
                'user_id': self.user.id,
                'user_email': self.user.email,
                'user_name': f"{self.user.first_name} {self.user.last_name}",
                'timestamp': timezone.now().isoformat()
            }
        )

    async def disconnect(self, close_code):
        """Handle WebSocket disconnect"""
        if self.conversation_id:
            # Notify others user left
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_leave',
                    'user_id': self.user.id,
                    'user_email': self.user.email,
                    'timestamp': timezone.now().isoformat()
                }
            )

            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

            # Clear typing indicator
            await self.clear_typing()

            # Set user as offline if not in other conversations
            await self.set_user_offline()

    async def receive(self, text_data):
        """Handle incoming WebSocket message"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'message':
                await self.handle_message(data)
            elif message_type == 'typing':
                await self.handle_typing(data)
            elif message_type == 'read':
                await self.handle_read_receipt(data)
            elif message_type == 'presence':
                await self.handle_presence(data)

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON'
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'error': str(e)
            }))

    # WebSocket message handlers

    async def handle_message(self, data):
        """Handle new message"""
        content = data.get('content', '').strip()
        reply_to_id = data.get('reply_to_id')

        if not content:
            await self.send(text_data=json.dumps({
                'error': 'Content required'
            }))
            return

        # Create message in database
        message = await self.save_message(content, reply_to_id)

        if message:
            # Broadcast to group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message_id': message.id,
                    'sender_id': self.user.id,
                    'sender_email': self.user.email,
                    'sender_name': f"{self.user.first_name} {self.user.last_name}",
                    'content': message.content,
                    'timestamp': message.created_at.isoformat(),
                    'reply_to_id': reply_to_id
                }
            )

            # Create notifications for other participants
            await self.create_notifications(message)

    async def handle_typing(self, data):
        """Handle typing indicator"""
        is_typing = data.get('is_typing', False)

        if is_typing:
            # Set typing indicator
            await self.set_typing()

            # Broadcast typing indicator
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_typing',
                    'user_id': self.user.id,
                    'user_email': self.user.email,
                    'timestamp': timezone.now().isoformat()
                }
            )
        else:
            # Clear typing indicator
            await self.clear_typing()

            # Broadcast stopped typing
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_stopped_typing',
                    'user_id': self.user.id,
                    'timestamp': timezone.now().isoformat()
                }
            )

    async def handle_read_receipt(self, data):
        """Handle message read receipt"""
        message_id = data.get('message_id')

        if message_id:
            await self.mark_message_read(message_id)

            # Broadcast read receipt
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message_read',
                    'message_id': message_id,
                    'user_id': self.user.id,
                    'timestamp': timezone.now().isoformat()
                }
            )

    async def handle_presence(self, data):
        """Handle presence update"""
        status = data.get('status')  # 'online' or 'away'

        await self.update_presence(status)

        # Broadcast presence update
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_presence_update',
                'user_id': self.user.id,
                'status': status,
                'timestamp': timezone.now().isoformat()
            }
        )

    # Broadcast event handlers

    async def chat_message(self, event):
        """Send message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message_id': event['message_id'],
            'sender': {
                'id': event['sender_id'],
                'email': event['sender_email'],
                'name': event['sender_name']
            },
            'content': event['content'],
            'timestamp': event['timestamp'],
            'reply_to_id': event.get('reply_to_id')
        }))

    async def user_typing(self, event):
        """Send typing indicator to WebSocket"""
        if event['user_id'] != self.user.id:  # Don't send to self
            await self.send(text_data=json.dumps({
                'type': 'user_typing',
                'user': {
                    'id': event['user_id'],
                    'email': event['user_email']
                },
                'timestamp': event['timestamp']
            }))

    async def user_stopped_typing(self, event):
        """Send stopped typing event to WebSocket"""
        if event['user_id'] != self.user.id:  # Don't send to self
            await self.send(text_data=json.dumps({
                'type': 'user_stopped_typing',
                'user_id': event['user_id'],
                'timestamp': event['timestamp']
            }))

    async def message_read(self, event):
        """Send read receipt to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'message_read',
            'message_id': event['message_id'],
            'user_id': event['user_id'],
            'timestamp': event['timestamp']
        }))

    async def user_join(self, event):
        """Send user joined event to WebSocket"""
        if event['user_id'] != self.user.id:  # Don't send to self
            await self.send(text_data=json.dumps({
                'type': 'user_join',
                'user': {
                    'id': event['user_id'],
                    'email': event['user_email'],
                    'name': event['user_name']
                },
                'timestamp': event['timestamp']
            }))

    async def user_leave(self, event):
        """Send user left event to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'user_leave',
            'user_id': event['user_id'],
            'user_email': event['user_email'],
            'timestamp': event['timestamp']
        }))

    async def user_presence_update(self, event):
        """Send presence update to WebSocket"""
        if event['user_id'] != self.user.id:  # Don't send to self
            await self.send(text_data=json.dumps({
                'type': 'user_presence_update',
                'user_id': event['user_id'],
                'status': event['status'],
                'timestamp': event['timestamp']
            }))

    # Database operations

    @database_sync_to_async
    def check_participant(self):
        """Check if user is participant in conversation"""
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            return conversation.participants.filter(id=self.user.id).exists()
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content, reply_to_id=None):
        """Save message to database"""
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            message = Message.objects.create(
                conversation=conversation,
                sender=self.user,
                content=content,
                reply_to_id=reply_to_id
            )
            # Update conversation last message time
            conversation.last_message_at = timezone.now()
            conversation.save(update_fields=['last_message_at'])

            return message
        except Exception as e:
            return None

    @database_sync_to_async
    def create_notifications(self, message):
        """Create notifications for other participants"""
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            for participant in conversation.participants.exclude(id=self.user.id):
                MessageNotification.objects.create(
                    recipient=participant,
                    conversation=conversation,
                    message=message,
                    sender=self.user
                )
        except Exception:
            pass

    @database_sync_to_async
    def mark_message_read(self, message_id):
        """Mark message as read"""
        try:
            message = Message.objects.get(id=message_id)
            MessageRead.objects.get_or_create(
                message=message,
                user=self.user
            )
        except Message.DoesNotExist:
            pass

    @database_sync_to_async
    def set_typing(self):
        """Set typing indicator"""
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            TypingIndicator.objects.update_or_create(
                conversation=conversation,
                user=self.user,
                defaults={'expires_at': timezone.now() + timezone.timedelta(seconds=3)}
            )
        except Conversation.DoesNotExist:
            pass

    @database_sync_to_async
    def clear_typing(self):
        """Clear typing indicator"""
        try:
            TypingIndicator.objects.filter(
                conversation_id=self.conversation_id,
                user=self.user
            ).delete()
        except Exception:
            pass

    @database_sync_to_async
    def set_user_online(self):
        """Mark user as online"""
        presence, _ = UserPresence.objects.get_or_create(user=self.user)
        presence.is_online = True
        presence.current_conversation_id = self.conversation_id
        presence.last_seen = timezone.now()
        presence.save()

    @database_sync_to_async
    def set_user_offline(self):
        """Mark user as offline"""
        try:
            presence = UserPresence.objects.get(user=self.user)
            # Check if user has other active connections
            # For now, mark as offline after 30 seconds of inactivity
            presence.is_online = False
            presence.current_conversation = None
            presence.save()
        except UserPresence.DoesNotExist:
            pass

    @database_sync_to_async
    def update_presence(self, status):
        """Update user presence"""
        presence, _ = UserPresence.objects.get_or_create(user=self.user)
        presence.is_online = (status == 'online')
        presence.last_seen = timezone.now()
        presence.save()


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for message notifications
    Handles notification delivery to users
    """

    async def connect(self):
        """Handle notification WebSocket connection"""
        self.user = self.scope["user"]
        self.notification_room = f'notifications_{self.user.id}'

        # Join notification room
        await self.channel_layer.group_add(
            self.notification_room,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        """Handle notification WebSocket disconnect"""
        await self.channel_layer.group_discard(
            self.notification_room,
            self.channel_name
        )

    async def notification_message(self, event):
        """Send notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification_id': event['notification_id'],
            'conversation_id': event['conversation_id'],
            'sender': event['sender'],
            'message_preview': event['message_preview'],
            'timestamp': event['timestamp']
        }))
