from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db.models import Count, Sum, Avg, Q

from .models import AuditLog, SystemMetric
from .serializers import AuditLogSerializer, SystemMetricSerializer
from apps.authentication.permissions import IsAdmin


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing audit logs (read-only)
    """
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['user', 'action', 'model_name']
    search_fields = ['action', 'model_name', 'object_id', 'user__email']
    ordering_fields = ['timestamp', 'created_at']
    ordering = ['-timestamp']

    @action(detail=False, methods=['get'])
    def user_activity(self, request):
        """
        Get activity summary by user
        """
        user_id = request.query_params.get('user_id')

        if not user_id:
            return Response(
                {'error': 'user_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        logs = AuditLog.objects.filter(user_id=user_id).values('action').annotate(
            count=Count('id')
        ).order_by('-count')

        return Response(logs, status=status.HTTP_200_OK)


class SystemMetricViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing system metrics
    """
    queryset = SystemMetric.objects.all()
    serializer_class = SystemMetricSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['metric_name', 'metric_type', 'campus']
    search_fields = ['metric_name', 'metric_type']
    ordering_fields = ['recorded_at', 'metric_value', 'created_at']
    ordering = ['-recorded_at']


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def dashboard_statistics(request):
    """
    Get comprehensive dashboard statistics
    """
    from apps.students.models import Student
    from apps.staff.models import StaffMember
    from apps.courses.models import Course, CourseOffering
    from apps.campuses.models import Campus
    from apps.finance.models import Payment, StudentFee
    from apps.authentication.models import User

    # Get campus filter if provided
    campus_id = request.query_params.get('campus_id')
    campus_filter = Q(campus_id=campus_id) if campus_id else Q()

    # Student statistics
    total_students = Student.objects.filter(campus_filter).count()
    active_students = Student.objects.filter(
        campus_filter, enrollment_status='ACTIVE'
    ).count()

    # Staff statistics
    total_staff = StaffMember.objects.filter(campus_filter).count()
    active_staff = StaffMember.objects.filter(
        campus_filter, status='ACTIVE'
    ).count()

    # Course statistics
    total_courses = Course.objects.filter(campus_filter).count()
    active_courses = Course.objects.filter(
        campus_filter, is_active=True
    ).count()

    # Course offering statistics
    total_offerings = CourseOffering.objects.filter(campus_filter).count()
    open_offerings = CourseOffering.objects.filter(
        campus_filter, status='OPEN'
    ).count()

    # Campus statistics
    total_campuses = Campus.objects.filter(is_active=True).count()

    # Finance statistics
    total_revenue = Payment.objects.filter(
        status='SUCCESS'
    ).aggregate(total=Sum('amount'))['total'] or 0

    total_pending_fees = StudentFee.objects.filter(
        status__in=['PENDING', 'PARTIAL', 'OVERDUE']
    ).aggregate(total=Sum('balance'))['total'] or 0

    # User statistics
    users_by_role = User.objects.values('role').annotate(
        count=Count('id')
    ).order_by('role')

    # Recent activities (last 7 days)
    from datetime import timedelta
    from django.utils import timezone

    last_week = timezone.now() - timedelta(days=7)
    recent_students = Student.objects.filter(
        created_at__gte=last_week
    ).count()

    recent_enrollments = CourseOffering.objects.filter(
        created_at__gte=last_week
    ).aggregate(total=Sum('enrolled_count'))['total'] or 0

    statistics = {
        'students': {
            'total': total_students,
            'active': active_students,
            'recent': recent_students
        },
        'staff': {
            'total': total_staff,
            'active': active_staff
        },
        'courses': {
            'total': total_courses,
            'active': active_courses
        },
        'offerings': {
            'total': total_offerings,
            'open': open_offerings
        },
        'campuses': {
            'total': total_campuses
        },
        'finance': {
            'total_revenue': float(total_revenue),
            'pending_fees': float(total_pending_fees)
        },
        'users_by_role': list(users_by_role),
        'recent_activity': {
            'new_students': recent_students,
            'new_enrollments': recent_enrollments
        }
    }

    return Response(statistics, status=status.HTTP_200_OK)
