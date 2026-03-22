from rest_framework import serializers
from .models import FeeStructure, StudentFee, Payment, Scholarship, StudentScholarship
from decimal import Decimal


class FeeStructureSerializer(serializers.ModelSerializer):
    """
    Serializer for FeeStructure model
    """
    program_name = serializers.CharField(source='program.name', read_only=True)
    campus_name = serializers.CharField(source='campus.name', read_only=True)

    class Meta:
        model = FeeStructure
        fields = [
            'id', 'program', 'program_name', 'semester', 'academic_year',
            'campus', 'campus_name', 'tuition_fee', 'lab_fee', 'library_fee',
            'sports_fee', 'other_fees', 'total_amount', 'due_date',
            'late_fine_percentage', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_amount', 'created_at', 'updated_at']

    def validate(self, attrs):
        """
        Calculate total amount from component fees
        """
        tuition_fee = attrs.get('tuition_fee', Decimal('0.00'))
        lab_fee = attrs.get('lab_fee', Decimal('0.00'))
        library_fee = attrs.get('library_fee', Decimal('0.00'))
        sports_fee = attrs.get('sports_fee', Decimal('0.00'))
        other_fees = attrs.get('other_fees', {})

        # Calculate total from other fees
        other_total = sum(Decimal(str(v)) for v in other_fees.values() if isinstance(v, (int, float, str)))

        # Calculate total amount
        total = tuition_fee + lab_fee + library_fee + sports_fee + other_total
        attrs['total_amount'] = total

        return attrs


class StudentFeeSerializer(serializers.ModelSerializer):
    """
    Serializer for StudentFee model
    """
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    fee_structure_details = FeeStructureSerializer(source='fee_structure', read_only=True)

    class Meta:
        model = StudentFee
        fields = [
            'id', 'student', 'student_id', 'student_name',
            'fee_structure', 'fee_structure_details', 'total_amount',
            'paid_amount', 'balance', 'status', 'due_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'balance', 'created_at', 'updated_at']

    def validate(self, attrs):
        """
        Calculate balance and update status
        """
        total_amount = attrs.get('total_amount', self.instance.total_amount if self.instance else Decimal('0.00'))
        paid_amount = attrs.get('paid_amount', self.instance.paid_amount if self.instance else Decimal('0.00'))

        # Calculate balance
        balance = total_amount - paid_amount
        attrs['balance'] = balance

        # Update status based on payment
        if balance <= 0:
            attrs['status'] = 'PAID'
        elif paid_amount > 0:
            attrs['status'] = 'PARTIAL'
        else:
            # Check if overdue
            from django.utils import timezone
            due_date = attrs.get('due_date', self.instance.due_date if self.instance else None)
            if due_date and timezone.now().date() > due_date:
                attrs['status'] = 'OVERDUE'
            else:
                attrs['status'] = 'PENDING'

        return attrs


class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for Payment model
    """
    student_id = serializers.CharField(source='student_fee.student.student_id', read_only=True)
    student_name = serializers.CharField(source='student_fee.student.user.get_full_name', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'student_fee', 'student_id', 'student_name',
            'amount', 'payment_method', 'transaction_id', 'payment_date',
            'status', 'gateway_response', 'processed_by', 'processed_by_name',
            'receipt_number', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'payment_date', 'processed_by', 'created_at', 'updated_at']

    def validate_transaction_id(self, value):
        """
        Validate that transaction ID is unique
        """
        payment_id = self.instance.id if self.instance else None
        if Payment.objects.filter(transaction_id=value).exclude(id=payment_id).exists():
            raise serializers.ValidationError('Payment with this transaction ID already exists.')
        return value

    def validate(self, attrs):
        """
        Validate payment data
        """
        student_fee = attrs.get('student_fee', self.instance.student_fee if self.instance else None)
        amount = attrs.get('amount')

        # Validate amount doesn't exceed balance
        if student_fee and amount > student_fee.balance:
            raise serializers.ValidationError({
                'amount': f'Payment amount cannot exceed balance ({student_fee.balance}).'
            })

        return attrs


class ScholarshipSerializer(serializers.ModelSerializer):
    """
    Serializer for Scholarship model
    """
    class Meta:
        model = Scholarship
        fields = [
            'id', 'name', 'type', 'amount', 'criteria', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class StudentScholarshipSerializer(serializers.ModelSerializer):
    """
    Serializer for StudentScholarship model
    """
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    scholarship_name = serializers.CharField(source='scholarship.name', read_only=True)

    class Meta:
        model = StudentScholarship
        fields = [
            'id', 'student', 'student_id', 'student_name',
            'scholarship', 'scholarship_name', 'amount_awarded',
            'academic_year', 'status', 'awarded_date', 'remarks',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'awarded_date', 'created_at', 'updated_at']

    def validate(self, attrs):
        """
        Validate scholarship award amount
        """
        scholarship = attrs.get('scholarship', self.instance.scholarship if self.instance else None)
        amount_awarded = attrs.get('amount_awarded')

        # Validate amount doesn't exceed scholarship amount
        if scholarship and amount_awarded > scholarship.amount:
            raise serializers.ValidationError({
                'amount_awarded': f'Awarded amount cannot exceed scholarship amount ({scholarship.amount}).'
            })

        return attrs
