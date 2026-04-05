"""
Advanced Analytics Views
Provides comprehensive analytics, trends, and insights
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Avg, Q, F, ExpressionWrapper, DurationField
from django.db.models.functions import TruncDate, TruncHour, TruncWeek, TruncMonth
from django.utils import timezone
from datetime import timedelta, datetime

from .models import AuditLog, SystemMetric
from .serializers import AuditLogSerializer
from apps.authentication.permissions import IsAdmin
from apps.authentication.models import User
from apps.authentication.session_models import LoginAttempt, UserSession
from apps.authentication.twofa_models import TwoFactorVerification
from apps.authentication.rbac_models import PermissionAuditLog


class AdvancedAnalyticsViewSet(viewsets.ViewSet):
    """
    Advanced Analytics Dashboard
    Provides comprehensive system analytics and insights
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    @action(detail=False, methods=['get'])
    def overview(self, request):
        """
        Get system-wide overview with key metrics
        """
        # Time range from query params (default: last 30 days)
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)

        # User activity metrics
        total_users = User.objects.count()
        active_users_count = User.objects.filter(
            is_active=True
        ).count()
        new_users_count = User.objects.filter(
            created_at__gte=start_date
        ).count()

        # Audit activity
        total_actions = AuditLog.objects.filter(
            timestamp__gte=start_date
        ).count()

        unique_active_users = AuditLog.objects.filter(
            timestamp__gte=start_date
        ).values('user').distinct().count()

        # Security metrics
        total_logins = LoginAttempt.objects.filter(
            created_at__gte=start_date
        ).count()

        failed_logins = LoginAttempt.objects.filter(
            created_at__gte=start_date,
            success=False
        ).count()

        login_success_rate = (
            (total_logins - failed_logins) / total_logins * 100
            if total_logins > 0 else 100
        )

        # Active sessions
        active_sessions = UserSession.objects.filter(
            is_active=True,
            expires_at__gt=timezone.now()
        ).count()

        # 2FA adoption
        twofa_enabled = User.objects.filter(
            two_factor_auth__is_enabled=True
        ).count()
        twofa_adoption_rate = (
            twofa_enabled / total_users * 100
            if total_users > 0 else 0
        )

        # System health
        avg_session_duration = UserSession.objects.filter(
            is_active=False,
            logged_out_at__isnull=False
        ).annotate(
            duration=ExpressionWrapper(
                F('logged_out_at') - F('created_at'),
                output_field=DurationField()
            )
        ).aggregate(avg_duration=Avg('duration'))['avg_duration']

        return Response({
            'users': {
                'total': total_users,
                'active': active_users_count,
                'new_last_period': new_users_count,
                'unique_active': unique_active_users,
            },
            'activity': {
                'total_actions': total_actions,
                'avg_actions_per_user': round(total_actions / unique_active_users, 2) if unique_active_users > 0 else 0,
            },
            'security': {
                'total_logins': total_logins,
                'failed_logins': failed_logins,
                'success_rate': round(login_success_rate, 2),
                'active_sessions': active_sessions,
                'twofa_enabled_users': twofa_enabled,
                'twofa_adoption_rate': round(twofa_adoption_rate, 2),
            },
            'system_health': {
                'avg_session_duration_minutes': (
                    round(avg_session_duration.total_seconds() / 60, 2)
                    if avg_session_duration else 0
                ),
            },
            'time_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': days,
            }
        })

    @action(detail=False, methods=['get'])
    def activity_timeline(self, request):
        """
        Get activity timeline with customizable grouping (hour, day, week, month)
        """
        # Parameters
        days = int(request.query_params.get('days', 30))
        group_by = request.query_params.get('group_by', 'day')  # hour, day, week, month

        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)

        # Choose truncation function based on group_by
        trunc_functions = {
            'hour': TruncHour,
            'day': TruncDate,
            'week': TruncWeek,
            'month': TruncMonth,
        }

        trunc_func = trunc_functions.get(group_by, TruncDate)

        # Activity over time
        activity_timeline = AuditLog.objects.filter(
            timestamp__gte=start_date
        ).annotate(
            period=trunc_func('timestamp')
        ).values('period').annotate(
            total_actions=Count('id'),
            unique_users=Count('user', distinct=True)
        ).order_by('period')

        # Login attempts over time
        login_timeline = LoginAttempt.objects.filter(
            created_at__gte=start_date
        ).annotate(
            period=trunc_func('created_at')
        ).values('period').annotate(
            total_attempts=Count('id'),
            successful=Count('id', filter=Q(success=True)),
            failed=Count('id', filter=Q(success=False))
        ).order_by('period')

        return Response({
            'activity': list(activity_timeline),
            'logins': list(login_timeline),
            'group_by': group_by,
            'time_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': days,
            }
        })

    @action(detail=False, methods=['get'])
    def security_analytics(self, request):
        """
        Security-focused analytics: failed logins, suspicious activity, 2FA usage
        """
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)

        # Failed login analysis
        failed_logins_by_reason = LoginAttempt.objects.filter(
            created_at__gte=start_date,
            success=False
        ).values('failure_reason').annotate(
            count=Count('id')
        ).order_by('-count')

        # Top failed login IPs
        top_failed_ips = LoginAttempt.objects.filter(
            created_at__gte=start_date,
            success=False
        ).values('ip_address').annotate(
            count=Count('id'),
            unique_emails=Count('email', distinct=True)
        ).order_by('-count')[:10]

        # Suspicious patterns (multiple failures from same IP)
        suspicious_ips = [
            ip for ip in top_failed_ips
            if ip['count'] > 5  # More than 5 failed attempts
        ]

        # 2FA verification statistics
        twofa_verifications = TwoFactorVerification.objects.filter(
            created_at__gte=start_date
        ).aggregate(
            total=Count('id'),
            successful=Count('id', filter=Q(success=True)),
            failed=Count('id', filter=Q(success=False))
        )

        twofa_success_rate = (
            twofa_verifications['successful'] / twofa_verifications['total'] * 100
            if twofa_verifications['total'] > 0 else 0
        )

        # 2FA usage by method
        twofa_by_method = TwoFactorVerification.objects.filter(
            created_at__gte=start_date
        ).values('method').annotate(
            count=Count('id'),
            successful=Count('id', filter=Q(success=True))
        ).order_by('-count')

        # Permission changes audit
        permission_changes = PermissionAuditLog.objects.filter(
            created_at__gte=start_date
        ).values('action').annotate(
            count=Count('id')
        ).order_by('-count')

        # Recent permission changes (last 20)
        recent_permission_changes = PermissionAuditLog.objects.filter(
            created_at__gte=start_date
        ).select_related('performed_by', 'user').order_by('-created_at')[:20]

        from apps.authentication.rbac_serializers import PermissionAuditLogSerializer

        return Response({
            'failed_logins': {
                'by_reason': list(failed_logins_by_reason),
                'top_ips': list(top_failed_ips),
                'suspicious_ips': suspicious_ips,
                'total_suspicious': len(suspicious_ips),
            },
            'two_factor_auth': {
                'total_verifications': twofa_verifications['total'],
                'successful': twofa_verifications['successful'],
                'failed': twofa_verifications['failed'],
                'success_rate': round(twofa_success_rate, 2),
                'by_method': list(twofa_by_method),
            },
            'permissions': {
                'changes_by_action': list(permission_changes),
                'recent_changes': PermissionAuditLogSerializer(recent_permission_changes, many=True).data,
            },
            'time_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': days,
            }
        })

    @action(detail=False, methods=['get'])
    def user_behavior(self, request):
        """
        User behavior analytics: most active users, action types, patterns
        """
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)

        # Most active users
        most_active_users = AuditLog.objects.filter(
            timestamp__gte=start_date
        ).values(
            'user__id', 'user__email', 'user__first_name', 'user__last_name'
        ).annotate(
            total_actions=Count('id'),
            unique_action_types=Count('action', distinct=True)
        ).order_by('-total_actions')[:20]

        # Most common actions
        common_actions = AuditLog.objects.filter(
            timestamp__gte=start_date
        ).values('action').annotate(
            count=Count('id'),
            unique_users=Count('user', distinct=True)
        ).order_by('-count')[:15]

        # Actions by model
        actions_by_model = AuditLog.objects.filter(
            timestamp__gte=start_date
        ).values('model_name').annotate(
            count=Count('id')
        ).order_by('-count')[:15]

        # User activity by role
        activity_by_role = AuditLog.objects.filter(
            timestamp__gte=start_date
        ).values('user__role').annotate(
            total_actions=Count('id'),
            unique_users=Count('user', distinct=True)
        ).order_by('-total_actions')

        # Peak activity hours
        peak_hours = AuditLog.objects.filter(
            timestamp__gte=start_date
        ).annotate(
            hour=TruncHour('timestamp')
        ).values('hour').annotate(
            count=Count('id')
        ).order_by('-count')[:5]

        return Response({
            'most_active_users': list(most_active_users),
            'common_actions': list(common_actions),
            'actions_by_model': list(actions_by_model),
            'activity_by_role': list(activity_by_role),
            'peak_activity_hours': list(peak_hours),
            'time_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': days,
            }
        })

    @action(detail=False, methods=['get'])
    def session_analytics(self, request):
        """
        Session-based analytics: device types, browsers, locations, duration
        """
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)

        # Sessions by device type
        sessions_by_device = UserSession.objects.filter(
            created_at__gte=start_date
        ).values('device_type').annotate(
            count=Count('id'),
            active=Count('id', filter=Q(is_active=True))
        ).order_by('-count')

        # Sessions by browser
        sessions_by_browser = UserSession.objects.filter(
            created_at__gte=start_date
        ).values('browser').annotate(
            count=Count('id')
        ).order_by('-count')[:10]

        # Sessions by country
        sessions_by_country = UserSession.objects.filter(
            created_at__gte=start_date
        ).values('country').annotate(
            count=Count('id')
        ).order_by('-count')[:15]

        # Average session duration
        completed_sessions = UserSession.objects.filter(
            created_at__gte=start_date,
            is_active=False,
            logged_out_at__isnull=False
        ).annotate(
            duration=ExpressionWrapper(
                F('logged_out_at') - F('created_at'),
                output_field=DurationField()
            )
        )

        avg_duration = completed_sessions.aggregate(
            avg=Avg('duration')
        )['avg']

        # Session duration distribution
        duration_buckets = {
            '0-5min': completed_sessions.filter(duration__lte=timedelta(minutes=5)).count(),
            '5-15min': completed_sessions.filter(
                duration__gt=timedelta(minutes=5),
                duration__lte=timedelta(minutes=15)
            ).count(),
            '15-30min': completed_sessions.filter(
                duration__gt=timedelta(minutes=15),
                duration__lte=timedelta(minutes=30)
            ).count(),
            '30-60min': completed_sessions.filter(
                duration__gt=timedelta(minutes=30),
                duration__lte=timedelta(minutes=60)
            ).count(),
            '1hr+': completed_sessions.filter(duration__gt=timedelta(hours=1)).count(),
        }

        # Concurrent users over time (daily peak)
        concurrent_users = UserSession.objects.filter(
            created_at__gte=start_date
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            peak_concurrent=Count('id')
        ).order_by('date')

        return Response({
            'device_distribution': list(sessions_by_device),
            'browser_distribution': list(sessions_by_browser),
            'geographic_distribution': list(sessions_by_country),
            'session_duration': {
                'average_minutes': round(avg_duration.total_seconds() / 60, 2) if avg_duration else 0,
                'distribution': duration_buckets,
            },
            'concurrent_users': list(concurrent_users),
            'time_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': days,
            }
        })

    @action(detail=False, methods=['get'])
    def export_report(self, request):
        """
        Generate and export comprehensive analytics report
        """
        # This would generate a PDF or Excel report
        # For now, return comprehensive JSON data

        days = int(request.query_params.get('days', 30))

        overview_data = self.overview(request).data
        timeline_data = self.activity_timeline(request).data
        security_data = self.security_analytics(request).data
        behavior_data = self.user_behavior(request).data
        session_data = self.session_analytics(request).data

        return Response({
            'report_generated_at': timezone.now().isoformat(),
            'report_period_days': days,
            'overview': overview_data,
            'timeline': timeline_data,
            'security': security_data,
            'user_behavior': behavior_data,
            'sessions': session_data,
        })
