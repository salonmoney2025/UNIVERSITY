"""
API Views for Session Management
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q, Count
from datetime import timedelta

from .session_models import (
    UserSession, SessionActivity, LoginAttempt, DeviceFingerprint
)
from .session_serializers import (
    UserSessionSerializer, SessionActivitySerializer,
    LoginAttemptSerializer, DeviceFingerprintSerializer,
    SessionSummarySerializer
)


class UserSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user sessions
    """
    serializer_class = UserSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Super admin can see all sessions
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            queryset = UserSession.objects.select_related('user')
        else:
            # Users can only see their own sessions
            queryset = UserSession.objects.filter(user=user)

        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        return queryset.order_by('-last_activity')

    @action(detail=False, methods=['get'])
    def my_sessions(self, request):
        """Get all sessions for current user"""
        sessions = UserSession.objects.filter(
            user=request.user,
            is_active=True
        ).order_by('-last_activity')

        serializer = self.get_serializer(sessions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def active_sessions(self, request):
        """Get all active sessions for current user"""
        now = timezone.now()
        sessions = UserSession.objects.filter(
            user=request.user,
            is_active=True,
            expires_at__gt=now
        ).order_by('-last_activity')

        serializer = self.get_serializer(sessions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def terminate(self, request, pk=None):
        """Terminate a specific session"""
        session = self.get_object()

        # Users can only terminate their own sessions (unless admin)
        if session.user != request.user and request.user.role not in ['SUPER_ADMIN', 'ADMIN']:
            return Response(
                {'error': 'You can only terminate your own sessions'},
                status=status.HTTP_403_FORBIDDEN
            )

        session.terminate()

        return Response({
            'message': 'Session terminated successfully',
            'session_id': str(session.id)
        })

    @action(detail=False, methods=['post'])
    def terminate_all(self, request):
        """Terminate all sessions except current one"""
        # Get current session token from request
        current_token = request.META.get('HTTP_AUTHORIZATION', '').replace('Bearer ', '')

        # Terminate all other sessions
        terminated_count = UserSession.objects.filter(
            user=request.user,
            is_active=True
        ).exclude(
            session_token=current_token
        ).update(
            is_active=False,
            logout_at=timezone.now()
        )

        return Response({
            'message': f'Terminated {terminated_count} sessions',
            'count': terminated_count
        })

    @action(detail=False, methods=['post'])
    def terminate_other_devices(self, request):
        """Terminate sessions on other devices"""
        # Get current device fingerprint or session
        current_session_id = request.data.get('current_session_id')

        query = Q(user=request.user, is_active=True)
        if current_session_id:
            query &= ~Q(id=current_session_id)

        terminated_count = UserSession.objects.filter(query).update(
            is_active=False,
            logout_at=timezone.now()
        )

        return Response({
            'message': f'Terminated sessions on {terminated_count} devices',
            'count': terminated_count
        })

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get session summary for current user"""
        user = request.user
        now = timezone.now()

        # Count sessions
        total_sessions = UserSession.objects.filter(user=user).count()
        active_sessions = UserSession.objects.filter(
            user=user,
            is_active=True,
            expires_at__gt=now
        ).count()
        expired_sessions = UserSession.objects.filter(
            user=user,
            expires_at__lte=now
        ).count()
        suspicious_sessions = UserSession.objects.filter(
            user=user,
            is_suspicious=True
        ).count()

        # Get unique devices and locations
        unique_devices = UserSession.objects.filter(
            user=user
        ).values('device_type', 'device_name').distinct().count()

        unique_locations = UserSession.objects.filter(
            user=user
        ).values('country', 'city').distinct().count()

        # Get last login
        last_login = UserSession.objects.filter(
            user=user
        ).order_by('-login_at').first()

        # Get login attempts
        total_attempts = LoginAttempt.objects.filter(user=user).count()
        failed_attempts = LoginAttempt.objects.filter(
            user=user,
            success=False
        ).count()

        summary_data = {
            'total_sessions': total_sessions,
            'active_sessions': active_sessions,
            'expired_sessions': expired_sessions,
            'suspicious_sessions': suspicious_sessions,
            'unique_devices': unique_devices,
            'unique_locations': unique_locations,
            'last_login': last_login.login_at if last_login else None,
            'total_login_attempts': total_attempts,
            'failed_login_attempts': failed_attempts,
        }

        serializer = SessionSummarySerializer(summary_data)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def cleanup_expired(self, request):
        """Delete expired sessions (admin only)"""
        if request.user.role not in ['SUPER_ADMIN', 'ADMIN']:
            return Response(
                {'error': 'Only administrators can cleanup sessions'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Delete sessions older than 30 days
        cutoff_date = timezone.now() - timedelta(days=30)
        deleted_count, _ = UserSession.objects.filter(
            Q(logout_at__lt=cutoff_date) |
            Q(expires_at__lt=cutoff_date, is_active=False)
        ).delete()

        return Response({
            'message': f'Cleaned up {deleted_count} expired sessions',
            'count': deleted_count
        })


class SessionActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing session activities
    """
    serializer_class = SessionActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Super admin can see all activities
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            queryset = SessionActivity.objects.select_related('session')
        else:
            # Users can only see activities from their own sessions
            queryset = SessionActivity.objects.filter(session__user=user)

        # Filter by session
        session_id = self.request.query_params.get('session_id')
        if session_id:
            queryset = queryset.filter(session_id=session_id)

        # Filter by activity type
        activity_type = self.request.query_params.get('activity_type')
        if activity_type:
            queryset = queryset.filter(activity_type=activity_type)

        return queryset.order_by('-created_at')


class LoginAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing login attempts
    """
    serializer_class = LoginAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Super admin can see all login attempts
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            queryset = LoginAttempt.objects.select_related('user')
        else:
            # Users can only see their own login attempts
            queryset = LoginAttempt.objects.filter(user=user)

        # Filter by success status
        success = self.request.query_params.get('success')
        if success is not None:
            queryset = queryset.filter(success=success.lower() == 'true')

        # Filter by suspicious flag
        is_suspicious = self.request.query_params.get('is_suspicious')
        if is_suspicious is not None:
            queryset = queryset.filter(is_suspicious=is_suspicious.lower() == 'true')

        return queryset.order_by('-created_at')

    @action(detail=False, methods=['get'])
    def recent_failures(self, request):
        """Get recent failed login attempts"""
        attempts = LoginAttempt.objects.filter(
            user=request.user,
            success=False
        ).order_by('-created_at')[:10]

        serializer = self.get_serializer(attempts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def suspicious_attempts(self, request):
        """Get suspicious login attempts"""
        attempts = LoginAttempt.objects.filter(
            user=request.user,
            is_suspicious=True
        ).order_by('-created_at')[:20]

        serializer = self.get_serializer(attempts, many=True)
        return Response(serializer.data)


class DeviceFingerprintViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing device fingerprints
    """
    serializer_class = DeviceFingerprintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Super admin can see all fingerprints
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            queryset = DeviceFingerprint.objects.select_related('user')
        else:
            # Users can only see their own fingerprints
            queryset = DeviceFingerprint.objects.filter(user=user)

        # Filter by trusted status
        is_trusted = self.request.query_params.get('is_trusted')
        if is_trusted is not None:
            queryset = queryset.filter(is_trusted=is_trusted.lower() == 'true')

        return queryset.order_by('-last_seen_at')

    @action(detail=True, methods=['post'])
    def trust(self, request, pk=None):
        """Mark a device as trusted"""
        fingerprint = self.get_object()

        # Users can only trust their own devices
        if fingerprint.user != request.user and request.user.role not in ['SUPER_ADMIN', 'ADMIN']:
            return Response(
                {'error': 'You can only trust your own devices'},
                status=status.HTTP_403_FORBIDDEN
            )

        fingerprint.mark_trusted()

        return Response({
            'message': 'Device marked as trusted',
            'device_id': str(fingerprint.id)
        })

    @action(detail=True, methods=['post'])
    def revoke_trust(self, request, pk=None):
        """Revoke trust from a device"""
        fingerprint = self.get_object()

        # Users can only revoke trust from their own devices
        if fingerprint.user != request.user and request.user.role not in ['SUPER_ADMIN', 'ADMIN']:
            return Response(
                {'error': 'You can only revoke trust from your own devices'},
                status=status.HTTP_403_FORBIDDEN
            )

        fingerprint.is_trusted = False
        fingerprint.save()

        return Response({
            'message': 'Device trust revoked',
            'device_id': str(fingerprint.id)
        })

    @action(detail=False, methods=['get'])
    def trusted_devices(self, request):
        """Get all trusted devices for current user"""
        devices = DeviceFingerprint.objects.filter(
            user=request.user,
            is_trusted=True
        ).order_by('-last_seen_at')

        serializer = self.get_serializer(devices, many=True)
        return Response(serializer.data)
