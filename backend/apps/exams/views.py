from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import Exam, Grade, Transcript
from .serializers import ExamSerializer, GradeSerializer, TranscriptSerializer
from apps.authentication.permissions import IsAdmin, IsAdminOrReadOnly, IsLecturer


class ExamViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing exams
    """
    queryset = Exam.objects.filter(is_deleted=False)
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['course_offering', 'exam_type', 'date']
    search_fields = ['name', 'course_offering__course__code', 'course_offering__course__title']
    ordering_fields = ['date', 'start_time', 'created_at']
    ordering = ['-date', 'start_time']

    @action(detail=True, methods=['get'])
    def grades(self, request, pk=None):
        """
        Get all grades for an exam
        """
        exam = self.get_object()
        grades = Grade.objects.filter(exam=exam)
        serializer = GradeSerializer(grades, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """
        Get exam statistics
        """
        exam = self.get_object()

        from django.db.models import Avg, Max, Min, Count

        stats = Grade.objects.filter(exam=exam).aggregate(
            total_students=Count('id'),
            average_marks=Avg('marks_obtained'),
            highest_marks=Max('marks_obtained'),
            lowest_marks=Min('marks_obtained'),
            passed_count=Count('id', filter=models.Q(marks_obtained__gte=exam.passing_marks))
        )

        # Calculate pass percentage
        if stats['total_students'] > 0:
            stats['pass_percentage'] = round(
                (stats['passed_count'] / stats['total_students']) * 100, 2
            )
        else:
            stats['pass_percentage'] = 0

        return Response(stats, status=status.HTTP_200_OK)


class GradeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing grades
    """
    queryset = Grade.objects.filter(is_deleted=False)
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['student', 'exam', 'graded_by']
    search_fields = ['student__student_id', 'exam__name', 'exam__course_offering__course__code']
    ordering_fields = ['graded_date', 'marks_obtained', 'created_at']
    ordering = ['-graded_date']

    def perform_create(self, serializer):
        """
        Auto-set graded_by to current user
        """
        serializer.save(graded_by=self.request.user)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def bulk_grade(self, request):
        """
        Bulk grade multiple students for an exam
        """
        grades_data = request.data.get('grades', [])

        if not grades_data:
            return Response(
                {'error': 'grades data is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        grades = []
        errors = []

        for data in grades_data:
            try:
                from apps.students.models import Student

                student = Student.objects.get(id=data['student_id'])
                exam = Exam.objects.get(id=data['exam_id'])
                marks_obtained = data['marks_obtained']
                remarks = data.get('remarks', '')

                # Check if grade already exists
                grade, created = Grade.objects.get_or_create(
                    student=student,
                    exam=exam,
                    defaults={
                        'marks_obtained': marks_obtained,
                        'graded_by': request.user,
                        'remarks': remarks
                    }
                )

                if not created:
                    # Update existing grade
                    grade.marks_obtained = marks_obtained
                    grade.graded_by = request.user
                    grade.remarks = remarks
                    grade.save()

                grades.append(grade)

            except (Student.DoesNotExist, Exam.DoesNotExist, KeyError) as e:
                errors.append(f"Error processing grade: {str(e)}")

        return Response({
            'grades': GradeSerializer(grades, many=True).data,
            'errors': errors,
            'total_graded': len(grades),
            'total_errors': len(errors)
        }, status=status.HTTP_201_CREATED)


class TranscriptViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing transcripts
    """
    queryset = Transcript.objects.filter(is_deleted=False)
    serializer_class = TranscriptSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['student', 'semester', 'academic_year']
    search_fields = ['student__student_id', 'student__user__first_name', 'student__user__last_name']
    ordering_fields = ['academic_year', 'semester', 'gpa', 'cgpa', 'generated_date']
    ordering = ['-academic_year', '-semester']

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def issue(self, request, pk=None):
        """
        Issue a transcript (set issued_date)
        """
        transcript = self.get_object()

        from django.utils import timezone
        transcript.issued_date = timezone.now().date()
        transcript.save()

        return Response(
            {'message': 'Transcript issued successfully'},
            status=status.HTTP_200_OK
        )
