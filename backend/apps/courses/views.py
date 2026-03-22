from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import Program, Course, CourseOffering
from .serializers import ProgramSerializer, CourseSerializer, CourseOfferingSerializer
from apps.authentication.permissions import IsAdmin, IsAdminOrReadOnly


class ProgramViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing academic programs
    """
    queryset = Program.objects.filter(is_deleted=False)
    serializer_class = ProgramSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['campus', 'department', 'degree_type', 'is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'degree_type', 'created_at']
    ordering = ['campus', 'degree_type', 'name']

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """
        Get all students enrolled in a program
        """
        program = self.get_object()

        from apps.students.models import Student
        from apps.students.serializers import StudentSerializer

        students = Student.objects.filter(program=program, user__is_active=True)
        serializer = StudentSerializer(students, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class CourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing courses
    """
    queryset = Course.objects.filter(is_deleted=False)
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['campus', 'department', 'is_elective', 'is_active']
    search_fields = ['code', 'title', 'description']
    ordering_fields = ['code', 'title', 'credits', 'created_at']
    ordering = ['code']

    @action(detail=True, methods=['get'])
    def offerings(self, request, pk=None):
        """
        Get all offerings of a course
        """
        course = self.get_object()
        offerings = CourseOffering.objects.filter(course=course)
        serializer = CourseOfferingSerializer(offerings, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class CourseOfferingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing course offerings
    """
    queryset = CourseOffering.objects.filter(is_deleted=False)
    serializer_class = CourseOfferingSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['course', 'semester', 'academic_year', 'campus', 'instructor', 'status']
    search_fields = ['course__code', 'course__title', 'room']
    ordering_fields = ['academic_year', 'semester', 'enrolled_count', 'created_at']
    ordering = ['-academic_year', 'semester']

    @action(detail=True, methods=['get'])
    def enrollments(self, request, pk=None):
        """
        Get all enrollments for a course offering
        """
        offering = self.get_object()

        from apps.students.models import Enrollment
        from apps.students.serializers import EnrollmentSerializer

        enrollments = Enrollment.objects.filter(course_offering=offering)
        serializer = EnrollmentSerializer(enrollments, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def attendance(self, request, pk=None):
        """
        Get attendance records for a course offering
        """
        offering = self.get_object()

        from apps.students.models import Attendance
        from apps.students.serializers import AttendanceSerializer

        attendance_records = Attendance.objects.filter(course_offering=offering)
        serializer = AttendanceSerializer(attendance_records, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def close_enrollment(self, request, pk=None):
        """
        Close enrollment for a course offering
        """
        offering = self.get_object()
        offering.status = 'CLOSED'
        offering.save()

        return Response(
            {'message': 'Course offering enrollment closed successfully'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def open_enrollment(self, request, pk=None):
        """
        Open enrollment for a course offering
        """
        offering = self.get_object()
        offering.status = 'OPEN'
        offering.save()

        return Response(
            {'message': 'Course offering enrollment opened successfully'},
            status=status.HTTP_200_OK
        )
