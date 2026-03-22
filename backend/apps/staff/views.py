from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import StaffMember, StaffAttendance
from .serializers import StaffMemberSerializer, StaffAttendanceSerializer
from apps.authentication.permissions import IsAdmin, IsAdminOrReadOnly


class StaffMemberViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing staff members
    """
    queryset = StaffMember.objects.filter(is_deleted=False)
    serializer_class = StaffMemberSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['campus', 'department', 'employment_type', 'status']
    search_fields = ['staff_id', 'user__email', 'user__first_name', 'user__last_name', 'designation', 'specialization']
    ordering_fields = ['staff_id', 'hire_date', 'salary', 'created_at']
    ordering = ['-hire_date']

    def perform_create(self, serializer):
        """
        Auto-generate staff ID when creating a staff member
        """
        import datetime
        campus = serializer.validated_data['campus']
        year = datetime.datetime.now().year

        # Get the last staff ID for this campus
        last_staff = StaffMember.objects.filter(
            campus=campus,
            staff_id__startswith=f"STF{campus.code}{year}"
        ).order_by('-staff_id').first()

        if last_staff:
            # Extract the sequence number and increment
            sequence = int(last_staff.staff_id[-4:]) + 1
        else:
            sequence = 1

        staff_id = f"STF{campus.code}{year}{sequence:04d}"
        serializer.save(staff_id=staff_id)

    @action(detail=True, methods=['get'])
    def courses_taught(self, request, pk=None):
        """
        Get all courses taught by a staff member
        """
        staff = self.get_object()

        from apps.courses.models import CourseOffering
        from apps.courses.serializers import CourseOfferingSerializer

        courses = CourseOffering.objects.filter(instructor=staff)
        serializer = CourseOfferingSerializer(courses, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def attendance_summary(self, request, pk=None):
        """
        Get attendance summary for a staff member
        """
        staff = self.get_object()

        from django.db.models import Count, Q, Sum, Avg

        summary = StaffAttendance.objects.filter(staff=staff).aggregate(
            total_days=Count('id'),
            present=Count('id', filter=Q(status='PRESENT')),
            absent=Count('id', filter=Q(status='ABSENT')),
            half_day=Count('id', filter=Q(status='HALF_DAY')),
            on_leave=Count('id', filter=Q(status='ON_LEAVE')),
            total_hours=Sum('hours_worked'),
            average_hours=Avg('hours_worked')
        )

        # Calculate attendance percentage
        if summary['total_days'] > 0:
            summary['attendance_percentage'] = round(
                summary['present'] / summary['total_days'] * 100, 2
            )
        else:
            summary['attendance_percentage'] = 0

        return Response(summary, status=status.HTTP_200_OK)


class StaffAttendanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing staff attendance
    """
    queryset = StaffAttendance.objects.filter(is_deleted=False)
    serializer_class = StaffAttendanceSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['staff', 'date', 'status']
    search_fields = ['staff__staff_id', 'staff__user__first_name', 'staff__user__last_name']
    ordering_fields = ['date', 'created_at']
    ordering = ['-date']

    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        """
        Bulk mark attendance for multiple staff members
        """
        attendances_data = request.data.get('attendances', [])

        if not attendances_data:
            return Response(
                {'error': 'attendances data is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        attendances = []
        errors = []

        for data in attendances_data:
            try:
                staff = StaffMember.objects.get(id=data['staff_id'])
                date = data['date']
                status_value = data.get('status', 'PRESENT')
                check_in = data.get('check_in')
                check_out = data.get('check_out')

                # Check if attendance already exists
                attendance, created = StaffAttendance.objects.get_or_create(
                    staff=staff,
                    date=date,
                    defaults={
                        'status': status_value,
                        'check_in': check_in,
                        'check_out': check_out
                    }
                )

                if not created:
                    # Update existing attendance
                    attendance.status = status_value
                    if check_in:
                        attendance.check_in = check_in
                    if check_out:
                        attendance.check_out = check_out
                    attendance.save()

                attendances.append(attendance)

            except (StaffMember.DoesNotExist, KeyError) as e:
                errors.append(f"Error processing attendance: {str(e)}")

        return Response({
            'attendances': StaffAttendanceSerializer(attendances, many=True).data,
            'errors': errors,
            'total_marked': len(attendances),
            'total_errors': len(errors)
        }, status=status.HTTP_201_CREATED)
