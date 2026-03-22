from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import Campus, Department, Faculty
from .serializers import CampusSerializer, DepartmentSerializer, FacultySerializer
from apps.authentication.permissions import IsAdmin, IsAdminOrReadOnly


class CampusViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing campuses
    """
    queryset = Campus.objects.filter(is_deleted=False)
    serializer_class = CampusSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'city', 'state', 'country']
    search_fields = ['name', 'code', 'city', 'email']
    ordering_fields = ['name', 'code', 'created_at']
    ordering = ['name']

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """
        Get campus statistics
        """
        campus = self.get_object()

        from apps.students.models import Student
        from apps.staff.models import StaffMember

        stats = {
            'total_students': campus.users.filter(role='STUDENT', is_active=True).count(),
            'total_staff': campus.users.filter(role='LECTURER', is_active=True).count(),
            'total_departments': campus.departments.filter(is_active=True).count(),
            'total_faculties': campus.faculties.count(),
            'active_students': Student.objects.filter(
                campus=campus,
                enrollment_status='ACTIVE'
            ).count(),
            'active_staff': StaffMember.objects.filter(
                campus=campus,
                status='ACTIVE'
            ).count(),
        }

        return Response(stats, status=status.HTTP_200_OK)


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing departments
    """
    queryset = Department.objects.filter(is_deleted=False)
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['campus', 'is_active', 'head']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'created_at']
    ordering = ['campus', 'name']

    @action(detail=True, methods=['get'])
    def courses(self, request, pk=None):
        """
        Get all courses in a department
        """
        department = self.get_object()
        from apps.courses.models import Course
        from apps.courses.serializers import CourseSerializer

        courses = Course.objects.filter(department=department, is_active=True)
        serializer = CourseSerializer(courses, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """
        Get all students in a department
        """
        department = self.get_object()
        from apps.students.models import Student
        from apps.students.serializers import StudentSerializer

        students = Student.objects.filter(department=department, user__is_active=True)
        serializer = StudentSerializer(students, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class FacultyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing faculties
    """
    queryset = Faculty.objects.filter(is_deleted=False)
    serializer_class = FacultySerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['campus', 'dean']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'created_at']
    ordering = ['campus', 'name']
