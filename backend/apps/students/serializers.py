from rest_framework import serializers
from .models import Student, Enrollment, Attendance


class StudentSerializer(serializers.ModelSerializer):
    """
    Serializer for Student model
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    campus_name = serializers.CharField(source='campus.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    program_name = serializers.CharField(source='program.name', read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'user', 'user_email', 'user_name', 'student_id',
            'campus', 'campus_name', 'department', 'department_name',
            'program', 'program_name', 'admission_date', 'enrollment_status',
            'current_semester', 'gpa', 'guardian_name', 'guardian_phone',
            'guardian_email', 'medical_info', 'blood_group', 'address',
            'emergency_contact', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'student_id', 'created_at', 'updated_at']

    def validate(self, attrs):
        """
        Validate student data
        """
        user = attrs.get('user', self.instance.user if self.instance else None)

        # Ensure user has STUDENT role
        if user and user.role != 'STUDENT':
            raise serializers.ValidationError({
                'user': 'User must have STUDENT role.'
            })

        return attrs


class EnrollmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Enrollment model
    """
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    course_code = serializers.CharField(source='course_offering.course.code', read_only=True)
    course_title = serializers.CharField(source='course_offering.course.title', read_only=True)
    instructor_name = serializers.CharField(
        source='course_offering.instructor.user.get_full_name',
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'student_id', 'student_name',
            'course_offering', 'course_code', 'course_title', 'instructor_name',
            'semester', 'academic_year', 'enrollment_date', 'status',
            'grade', 'grade_point', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'enrollment_date', 'created_at', 'updated_at']

    def validate(self, attrs):
        """
        Validate enrollment data
        """
        student = attrs.get('student', self.instance.student if self.instance else None)
        course_offering = attrs.get('course_offering', self.instance.course_offering if self.instance else None)

        # Check if student is already enrolled in this course offering
        if not self.instance:  # Only for new enrollments
            if Enrollment.objects.filter(student=student, course_offering=course_offering).exists():
                raise serializers.ValidationError({
                    'course_offering': 'Student is already enrolled in this course offering.'
                })

        # Check if course offering is full
        if course_offering and course_offering.is_full:
            raise serializers.ValidationError({
                'course_offering': 'This course offering is full.'
            })

        return attrs


class AttendanceSerializer(serializers.ModelSerializer):
    """
    Serializer for Attendance model
    """
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    course_code = serializers.CharField(source='course_offering.course.code', read_only=True)
    course_title = serializers.CharField(source='course_offering.course.title', read_only=True)
    marked_by_name = serializers.CharField(source='marked_by.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'student_id', 'student_name',
            'course_offering', 'course_code', 'course_title',
            'date', 'status', 'marked_by', 'marked_by_name',
            'remarks', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'marked_by', 'created_at', 'updated_at']

    def validate(self, attrs):
        """
        Validate attendance data
        """
        student = attrs.get('student', self.instance.student if self.instance else None)
        course_offering = attrs.get('course_offering', self.instance.course_offering if self.instance else None)
        date = attrs.get('date', self.instance.date if self.instance else None)

        # Check if attendance already exists for this combination
        attendance_id = self.instance.id if self.instance else None
        if Attendance.objects.filter(
            student=student,
            course_offering=course_offering,
            date=date
        ).exclude(id=attendance_id).exists():
            raise serializers.ValidationError({
                'date': 'Attendance record already exists for this student and course on this date.'
            })

        return attrs
