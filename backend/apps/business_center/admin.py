"""
Business Center Admin
"""
from django.contrib import admin
from .models import PinBatch, ApplicationPin, Receipt, SalesReport, PinVerification


@admin.register(PinBatch)
class PinBatchAdmin(admin.ModelAdmin):
    list_display = [
        'batch_number', 'pin_type', 'quantity', 'used_count',
        'remaining_count', 'price_per_pin', 'status', 'campus', 'created_at'
    ]
    list_filter = ['pin_type', 'status', 'campus', 'created_at']
    search_fields = ['batch_number', 'description']
    readonly_fields = [
        'id', 'batch_number', 'total_value', 'used_count',
        'remaining_count', 'created_at', 'updated_at'
    ]
    fieldsets = (
        ('Basic Information', {
            'fields': ('batch_number', 'pin_type', 'quantity', 'price_per_pin', 'total_value')
        }),
        ('Status', {
            'fields': ('status', 'used_count', 'remaining_count')
        }),
        ('Validity', {
            'fields': ('valid_from', 'valid_until')
        }),
        ('Location & Metadata', {
            'fields': ('campus', 'description', 'metadata')
        }),
        ('Audit', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ApplicationPin)
class ApplicationPinAdmin(admin.ModelAdmin):
    list_display = [
        'pin_number', 'serial_number', 'batch', 'status',
        'used_by', 'used_at', 'valid_until'
    ]
    list_filter = ['status', 'batch__pin_type', 'batch__campus', 'created_at']
    search_fields = ['pin_number', 'serial_number', 'used_by_email', 'used_by_phone']
    readonly_fields = [
        'id', 'pin_number', 'serial_number', 'status', 'used_by',
        'used_at', 'usage_ip', 'created_at', 'updated_at'
    ]
    fieldsets = (
        ('Pin Information', {
            'fields': ('batch', 'pin_number', 'serial_number', 'status')
        }),
        ('Usage Information', {
            'fields': (
                'used_by', 'used_by_email', 'used_by_phone',
                'used_at', 'usage_ip'
            )
        }),
        ('Validity', {
            'fields': ('valid_until',)
        }),
        ('Metadata', {
            'fields': ('metadata', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = [
        'receipt_number', 'receipt_type', 'payer_name', 'amount',
        'payment_method', 'payment_date', 'campus', 'is_cancelled'
    ]
    list_filter = [
        'receipt_type', 'payment_method', 'is_cancelled',
        'campus', 'payment_date'
    ]
    search_fields = [
        'receipt_number', 'payer_name', 'payer_email',
        'transaction_reference'
    ]
    readonly_fields = [
        'id', 'receipt_number', 'issued_by', 'is_cancelled',
        'cancelled_at', 'cancelled_by', 'created_at', 'updated_at'
    ]
    fieldsets = (
        ('Receipt Information', {
            'fields': ('receipt_number', 'receipt_type', 'description')
        }),
        ('Payer Information', {
            'fields': (
                'payer_name', 'payer_email', 'payer_phone', 'payer_user'
            )
        }),
        ('Transaction Details', {
            'fields': (
                'amount', 'payment_method', 'transaction_reference',
                'payment_date', 'pin_batch'
            )
        }),
        ('Location & Issuance', {
            'fields': ('campus', 'issued_by')
        }),
        ('Cancellation', {
            'fields': (
                'is_cancelled', 'cancelled_at', 'cancelled_by',
                'cancellation_reason'
            ),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('metadata', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SalesReport)
class SalesReportAdmin(admin.ModelAdmin):
    list_display = [
        'report_type', 'report_date', 'campus', 'total_revenue',
        'total_pins_sold', 'total_receipts_issued', 'created_at'
    ]
    list_filter = ['report_type', 'campus', 'report_date']
    search_fields = ['report_date']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        ('Report Information', {
            'fields': (
                'report_type', 'report_date', 'start_date',
                'end_date', 'campus'
            )
        }),
        ('Sales Statistics', {
            'fields': (
                'total_pins_sold', 'total_pins_revenue',
                'total_receipts_issued', 'total_receipts_amount',
                'total_revenue'
            )
        }),
        ('Breakdown', {
            'fields': ('sales_by_type', 'sales_by_method')
        }),
        ('Metadata', {
            'fields': ('generated_by', 'report_file', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PinVerification)
class PinVerificationAdmin(admin.ModelAdmin):
    list_display = [
        'pin', 'verified_by_email', 'verification_ip',
        'was_successful', 'created_at'
    ]
    list_filter = ['was_successful', 'created_at']
    search_fields = [
        'pin__pin_number', 'verified_by_email',
        'verified_by_phone', 'verification_ip'
    ]
    readonly_fields = ['id', 'created_at']
