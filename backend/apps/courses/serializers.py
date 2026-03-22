from rest_framework import serializers
from .models import Program, Course, CourseOffering


class ProgramSerializer(serializers.ModelSerializer):
    """
    Serializer for Program model
    """
    campus_name = serializers.CharField(source='campus.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Program
        fields = [
            'id', 'name', 'code', 'campus', 'campus_name',
            'department', 'department_name', 'degree_type',
            'duration_years', 'total_credits', 'description', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_code(self, value):
        """
        Validate that program code is unique
        """
        program_id = self.instance.id if self.instance else None
        if Program.objects.filter(code=value.upper()).exclude(id=program_id).exists():
            raise serializers.ValidationError('Program with this code already exists.')
        return value.upper()


class CourseSerializer(serializers.ModelSerializer):
    """
    Serializer for Course model
    """
    campus_name = serializers.CharField(source='campus.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    prerequisites_list = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'code', 'title', 'campus', 'campus_name',
            'department', 'department_name', 'credits', 'description',
            'syllabus', 'prerequisites', 'prerequisites_list',
            'is_elective', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_prerequisites_list(self, obj):
        """
        Get list of prerequisite courses
        """
        return [{'id': str(course.id), 'code': course.code, 'title': course.title}
                for course in obj.prerequisites.all()]

    def validate_code(self, value):
        """
        Validate that course code is unique
        """
        course_id = self.instance.id if self.instance else None
        if Course.objects.filter(code=value.upper()).exclude(id=course_id).exists():
            raise serializers.ValidationError('Course with this code already exists.')
        return value.upper()


class CourseOfferingSerializer(serializers.ModelSerializer):
    """
    Serializer for CourseOffering model
    """
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_credits = serializers.IntegerField(source='course.credits', read_only=True)
    campus_name = serializers.CharField(source='campus.name', read_only=True)
    instructor_name = serializers.CharField(
        source='instructor.user.get_full_name',
        read_only=True,
        allow_null=True
    )
    is_full = serializers.BooleanField(read_only=True)
    available_slots = serializers.IntegerField(read_only=True)

    class Meta:
        model = CourseOffering
        fields = [
            'id', 'course', 'course_code', 'course_title', 'course_credits',
            'semester', 'academic_year', 'campus', 'campus_name',
            'instructor', 'instructor_name', 'schedule', 'room',
            'max_students', 'enrolled_count', 'is_full', 'available_slots',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'enrolled_count', 'created_at', 'updated_at']

    def validate(self, attrs):
        """
        Validate course offering data
        """
        course = attrs.get('course', self.instance.course if self.instance else None)
        semester = attrs.get('semester', self.instance.semester if self.instance else None)
        academic_year = attrs.get('academic_year', self.instance.academic_year if self.instance else None)
        campus = attrs.get('campus', self.instance.campus if self.instance else None)

        # Validate unique course offering per semester
        offering_id = self.instance.id if self.instance else None
        if CourseOffering.objects.filter(
            course=course,
            semester=semester,
            academic_year=academic_year,
            campus=campus
        ).exclude(id=offering_id).exists():
            raise serializers.ValidationError({
                'course': 'This course is already offered in this semester and academic year at this campus.'
            })

        return attrs
