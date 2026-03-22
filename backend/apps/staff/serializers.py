from rest_framework import serializers
from .models import StaffMember, StaffAttendance


class StaffMemberSerializer(serializers.ModelSerializer):
    """
    Serializer for StaffMember model
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    campus_name = serializers.CharField(source='campus.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True, allow_null=True)

    class Meta:
        model = StaffMember
        fields = [
            'id', 'user', 'user_email', 'user_name', 'staff_id',
            'campus', 'campus_name', 'department', 'department_name',
            'designation', 'employment_type', 'hire_date', 'salary',
            'qualifications', 'specialization', 'office_location', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'staff_id', 'created_at', 'updated_at']

    def validate(self, attrs):
        """
        Validate staff member data
        """
        user = attrs.get('user', self.instance.user if self.instance else None)

        # Ensure user has LECTURER role
        if user and user.role != 'LECTURER':
            raise serializers.ValidationError({
                'user': 'User must have LECTURER role.'
            })

        return attrs


class StaffAttendanceSerializer(serializers.ModelSerializer):
    """
    Serializer for StaffAttendance model
    """
    staff_id_value = serializers.CharField(source='staff.staff_id', read_only=True)
    staff_name = serializers.CharField(source='staff.user.get_full_name', read_only=True)

    class Meta:
        model = StaffAttendance
        fields = [
            'id', 'staff', 'staff_id_value', 'staff_name',
            'date', 'check_in', 'check_out', 'status',
            'hours_worked', 'remarks', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        """
        Validate staff attendance data
        """
        staff = attrs.get('staff', self.instance.staff if self.instance else None)
        date = attrs.get('date', self.instance.date if self.instance else None)
        check_in = attrs.get('check_in')
        check_out = attrs.get('check_out')

        # Check if attendance already exists for this combination
        attendance_id = self.instance.id if self.instance else None
        if StaffAttendance.objects.filter(
            staff=staff,
            date=date
        ).exclude(id=attendance_id).exists():
            raise serializers.ValidationError({
                'date': 'Attendance record already exists for this staff member on this date.'
            })

        # Validate check-in and check-out times
        if check_in and check_out and check_out <= check_in:
            raise serializers.ValidationError({
                'check_out': 'Check-out time must be after check-in time.'
            })

        # Calculate hours worked if both times are provided
        if check_in and check_out:
            from datetime import datetime, timedelta
            check_in_dt = datetime.combine(date, check_in)
            check_out_dt = datetime.combine(date, check_out)
            hours = (check_out_dt - check_in_dt).total_seconds() / 3600
            attrs['hours_worked'] = round(hours, 2)

        return attrs
