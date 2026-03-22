"""
Business Center Serializers
"""
from rest_framework import serializers
from .models import PinBatch, ApplicationPin, Receipt, SalesReport, PinVerification
from apps.authentication.models import User
from apps.campuses.models import Campus


class PinBatchSerializer(serializers.ModelSerializer):
    """Serializer for Pin Batches"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    campus_name = serializers.CharField(source='campus.name', read_only=True, allow_null=True)
    pin_type_display = serializers.CharField(source='get_pin_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    usage_percentage = serializers.SerializerMethodField()

    class Meta:
        model = PinBatch
        fields = [
            'id', 'batch_number', 'pin_type', 'pin_type_display', 'quantity',
            'price_per_pin', 'total_value', 'status', 'status_display',
            'used_count', 'remaining_count', 'usage_percentage',
            'valid_from', 'valid_until', 'campus', 'campus_name',
            'created_by', 'created_by_name', 'description', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'batch_number', 'total_value', 'used_count', 'remaining_count',
            'created_at', 'updated_at'
        ]

    def get_usage_percentage(self, obj):
        """Calculate usage percentage"""
        if obj.quantity == 0:
            return 0
        return round((obj.used_count / obj.quantity) * 100, 2)


class PinBatchCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Pin Batches"""

    class Meta:
        model = PinBatch
        fields = [
            'pin_type', 'quantity', 'price_per_pin', 'valid_from',
            'valid_until', 'campus', 'description', 'metadata'
        ]

    def validate_quantity(self, value):
        """Ensure quantity is positive"""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value

    def validate_price_per_pin(self, value):
        """Ensure price is positive"""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value

    def validate(self, data):
        """Validate dates"""
        if data['valid_until'] <= data['valid_from']:
            raise serializers.ValidationError("valid_until must be after valid_from")
        return data

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        batch = PinBatch.objects.create(**validated_data)

        # Generate pins for this batch
        from .utils import generate_pins_for_batch
        generate_pins_for_batch(batch)

        return batch


class ApplicationPinSerializer(serializers.ModelSerializer):
    """Serializer for Application Pins"""
    batch_number = serializers.CharField(source='batch.batch_number', read_only=True)
    pin_type = serializers.CharField(source='batch.pin_type', read_only=True)
    pin_type_display = serializers.CharField(source='batch.get_pin_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    used_by_name = serializers.CharField(source='used_by.get_full_name', read_only=True, allow_null=True)
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = ApplicationPin
        fields = [
            'id', 'batch', 'batch_number', 'pin_type', 'pin_type_display',
            'pin_number', 'serial_number', 'status', 'status_display',
            'used_by', 'used_by_name', 'used_by_email', 'used_by_phone',
            'used_at', 'usage_ip', 'valid_until', 'is_expired',
            'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'pin_number', 'serial_number', 'status', 'used_by',
            'used_at', 'usage_ip', 'created_at', 'updated_at'
        ]

    def get_is_expired(self, obj):
        """Check if pin is expired"""
        from django.utils import timezone
        return timezone.now() > obj.valid_until


class PinVerifySerializer(serializers.Serializer):
    """Serializer for verifying a pin"""
    pin_number = serializers.CharField(required=True)
    serial_number = serializers.CharField(required=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    metadata = serializers.JSONField(required=False, default=dict)


class PinUseSerializer(serializers.Serializer):
    """Serializer for using a pin"""
    pin_number = serializers.CharField(required=True)
    serial_number = serializers.CharField(required=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    metadata = serializers.JSONField(required=False, default=dict)


class ReceiptSerializer(serializers.ModelSerializer):
    """Serializer for Receipts"""
    receipt_type_display = serializers.CharField(source='get_receipt_type_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    payer_user_name = serializers.CharField(source='payer_user.get_full_name', read_only=True, allow_null=True)
    campus_name = serializers.CharField(source='campus.name', read_only=True)
    issued_by_name = serializers.CharField(source='issued_by.get_full_name', read_only=True, allow_null=True)
    pin_batch_number = serializers.CharField(source='pin_batch.batch_number', read_only=True, allow_null=True)

    class Meta:
        model = Receipt
        fields = [
            'id', 'receipt_number', 'receipt_type', 'receipt_type_display',
            'payer_name', 'payer_email', 'payer_phone', 'payer_user', 'payer_user_name',
            'description', 'amount', 'payment_method', 'payment_method_display',
            'transaction_reference', 'payment_date', 'pin_batch', 'pin_batch_number',
            'campus', 'campus_name', 'issued_by', 'issued_by_name',
            'is_cancelled', 'cancelled_at', 'cancelled_by', 'cancellation_reason',
            'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'receipt_number', 'issued_by', 'is_cancelled',
            'cancelled_at', 'cancelled_by', 'created_at', 'updated_at'
        ]


class ReceiptCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Receipts"""

    class Meta:
        model = Receipt
        fields = [
            'receipt_type', 'payer_name', 'payer_email', 'payer_phone',
            'payer_user', 'description', 'amount', 'payment_method',
            'transaction_reference', 'payment_date', 'pin_batch',
            'campus', 'metadata'
        ]

    def validate_amount(self, value):
        """Ensure amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value

    def create(self, validated_data):
        validated_data['issued_by'] = self.context['request'].user
        return super().create(validated_data)


class SalesReportSerializer(serializers.ModelSerializer):
    """Serializer for Sales Reports"""
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    campus_name = serializers.CharField(source='campus.name', read_only=True, allow_null=True)
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = SalesReport
        fields = [
            'id', 'report_type', 'report_type_display', 'report_date',
            'start_date', 'end_date', 'campus', 'campus_name',
            'total_pins_sold', 'total_pins_revenue', 'total_receipts_issued',
            'total_receipts_amount', 'total_revenue', 'sales_by_type',
            'sales_by_method', 'generated_by', 'generated_by_name',
            'report_file', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PinVerificationSerializer(serializers.ModelSerializer):
    """Serializer for Pin Verifications"""
    pin_number = serializers.CharField(source='pin.pin_number', read_only=True)
    pin_serial = serializers.CharField(source='pin.serial_number', read_only=True)

    class Meta:
        model = PinVerification
        fields = [
            'id', 'pin', 'pin_number', 'pin_serial', 'verified_by_email',
            'verified_by_phone', 'verification_ip', 'user_agent',
            'was_successful', 'failure_reason', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
