from rest_framework import serializers
from .models import Campus, Department, Faculty


class CampusSerializer(serializers.ModelSerializer):
    """
    Serializer for Campus model
    """
    total_students = serializers.IntegerField(read_only=True)
    total_staff = serializers.IntegerField(read_only=True)

    class Meta:
        model = Campus
        fields = [
            'id', 'name', 'code', 'address', 'city', 'state',
            'country', 'phone', 'email', 'is_active', 'settings',
            'total_students', 'total_staff', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_code(self, value):
        """
        Validate that campus code is unique
        """
        campus_id = self.instance.id if self.instance else None
        if Campus.objects.filter(code=value.upper()).exclude(id=campus_id).exists():
            raise serializers.ValidationError('Campus with this code already exists.')
        return value.upper()


class DepartmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Department model
    """
    campus_name = serializers.CharField(source='campus.name', read_only=True)
    head_name = serializers.CharField(source='head.get_full_name', read_only=True, allow_null=True)
    total_students = serializers.IntegerField(read_only=True)
    total_courses = serializers.IntegerField(read_only=True)

    class Meta:
        model = Department
        fields = [
            'id', 'name', 'code', 'campus', 'campus_name',
            'description', 'head', 'head_name', 'is_active',
            'total_students', 'total_courses', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        """
        Validate department data
        """
        campus = attrs.get('campus', self.instance.campus if self.instance else None)
        code = attrs.get('code', self.instance.code if self.instance else None)
        head = attrs.get('head', self.instance.head if self.instance else None)

        # Validate unique campus-code combination
        department_id = self.instance.id if self.instance else None
        if Department.objects.filter(
            campus=campus,
            code=code.upper()
        ).exclude(id=department_id).exists():
            raise serializers.ValidationError({
                'code': 'Department with this code already exists in this campus.'
            })

        # Validate that head belongs to the same campus
        if head and head.campus != campus:
            raise serializers.ValidationError({
                'head': 'Department head must belong to the same campus.'
            })

        return attrs


class FacultySerializer(serializers.ModelSerializer):
    """
    Serializer for Faculty model
    """
    campus_name = serializers.CharField(source='campus.name', read_only=True)
    dean_name = serializers.CharField(source='dean.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = Faculty
        fields = [
            'id', 'name', 'code', 'campus', 'campus_name',
            'dean', 'dean_name', 'description',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        """
        Validate faculty data
        """
        campus = attrs.get('campus', self.instance.campus if self.instance else None)
        code = attrs.get('code', self.instance.code if self.instance else None)
        dean = attrs.get('dean', self.instance.dean if self.instance else None)

        # Validate unique campus-code combination
        faculty_id = self.instance.id if self.instance else None
        if Faculty.objects.filter(
            campus=campus,
            code=code.upper()
        ).exclude(id=faculty_id).exists():
            raise serializers.ValidationError({
                'code': 'Faculty with this code already exists in this campus.'
            })

        # Validate that dean belongs to the same campus
        if dean and dean.campus != campus:
            raise serializers.ValidationError({
                'dean': 'Faculty dean must belong to the same campus.'
            })

        return attrs
