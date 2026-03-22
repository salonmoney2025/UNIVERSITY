"""
Business Center Models
Handles application pins, receipts, and business transactions
"""
from django.db import models
from django.utils import timezone
from apps.authentication.models import BaseModel, User
from apps.campuses.models import Campus
import random
import string


class PinBatch(BaseModel):
    """
    Batch of application pins generated together
    """
    BATCH_STATUS = (
        ('ACTIVE', 'Active'),
        ('DEPLETED', 'Depleted'),
        ('EXPIRED', 'Expired'),
        ('CANCELLED', 'Cancelled'),
    )

    PIN_TYPES = (
        ('APPLICATION', 'Application Form'),
        ('ADMISSION', 'Admission Processing'),
        ('TRANSCRIPT', 'Transcript Request'),
        ('VERIFICATION', 'Document Verification'),
        ('PORTAL_ACCESS', 'Portal Access'),
        ('CUSTOM', 'Custom'),
    )

    batch_number = models.CharField(max_length=100, unique=True, db_index=True)
    pin_type = models.CharField(max_length=50, choices=PIN_TYPES)
    quantity = models.IntegerField()
    price_per_pin = models.DecimalField(max_digits=10, decimal_places=2)
    total_value = models.DecimalField(max_digits=15, decimal_places=2)

    # Status
    status = models.CharField(max_length=50, choices=BATCH_STATUS, default='ACTIVE')
    used_count = models.IntegerField(default=0)
    remaining_count = models.IntegerField()

    # Validity
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField()

    # Campus and metadata
    campus = models.ForeignKey(
        Campus,
        on_delete=models.CASCADE,
        related_name='pin_batches',
        null=True,
        blank=True
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_pin_batches'
    )

    # Additional info
    description = models.TextField(blank=True, null=True)
    metadata = models.JSONField(default=dict)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Pin Batch'
        verbose_name_plural = 'Pin Batches'
        indexes = [
            models.Index(fields=['batch_number']),
            models.Index(fields=['status', 'pin_type']),
            models.Index(fields=['campus', 'status']),
        ]

    def __str__(self):
        return f"{self.batch_number} - {self.get_pin_type_display()}"

    def save(self, *args, **kwargs):
        # Calculate total value
        self.total_value = self.quantity * self.price_per_pin
        # Set remaining count if new
        if not self.pk:
            self.remaining_count = self.quantity
            if not self.batch_number:
                self.batch_number = self.generate_batch_number()
        super().save(*args, **kwargs)

    def generate_batch_number(self):
        """Generate unique batch number"""
        campus_code = self.campus.code if self.campus else 'SYS'
        date_code = timezone.now().strftime('%Y%m%d')
        random_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"BATCH-{campus_code}-{date_code}-{random_code}"


class ApplicationPin(BaseModel):
    """
    Individual application pin
    """
    PIN_STATUS = (
        ('UNUSED', 'Unused'),
        ('USED', 'Used'),
        ('EXPIRED', 'Expired'),
        ('CANCELLED', 'Cancelled'),
    )

    batch = models.ForeignKey(
        PinBatch,
        on_delete=models.CASCADE,
        related_name='pins'
    )

    # Pin details
    pin_number = models.CharField(max_length=50, unique=True, db_index=True)
    serial_number = models.CharField(max_length=50, unique=True, db_index=True)

    # Status
    status = models.CharField(max_length=50, choices=PIN_STATUS, default='UNUSED')

    # Usage tracking
    used_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='used_pins'
    )
    used_by_email = models.EmailField(blank=True, null=True)
    used_by_phone = models.CharField(max_length=20, blank=True, null=True)
    used_at = models.DateTimeField(null=True, blank=True)
    usage_ip = models.GenericIPAddressField(null=True, blank=True)

    # Validity
    valid_until = models.DateTimeField()

    # Metadata
    metadata = models.JSONField(
        default=dict,
        help_text="Additional data from pin usage"
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Application Pin'
        verbose_name_plural = 'Application Pins'
        indexes = [
            models.Index(fields=['pin_number']),
            models.Index(fields=['serial_number']),
            models.Index(fields=['status', 'batch']),
            models.Index(fields=['used_by']),
        ]

    def __str__(self):
        return f"{self.pin_number} ({self.serial_number})"

    def use_pin(self, user=None, email=None, phone=None, ip_address=None, metadata=None):
        """Mark pin as used"""
        if self.status != 'UNUSED':
            raise ValueError(f"Pin is already {self.status}")

        if timezone.now() > self.valid_until:
            self.status = 'EXPIRED'
            self.save()
            raise ValueError("Pin has expired")

        self.status = 'USED'
        self.used_by = user
        self.used_by_email = email
        self.used_by_phone = phone
        self.used_at = timezone.now()
        self.usage_ip = ip_address
        if metadata:
            self.metadata.update(metadata)
        self.save()

        # Update batch counts
        self.batch.used_count += 1
        self.batch.remaining_count -= 1
        if self.batch.remaining_count == 0:
            self.batch.status = 'DEPLETED'
        self.batch.save()


class Receipt(BaseModel):
    """
    Business receipt for transactions
    """
    RECEIPT_TYPES = (
        ('PIN_PURCHASE', 'Pin Purchase'),
        ('FEE_PAYMENT', 'Fee Payment'),
        ('APPLICATION_FEE', 'Application Fee'),
        ('SERVICE_CHARGE', 'Service Charge'),
        ('VERIFICATION_FEE', 'Verification Fee'),
        ('CUSTOM', 'Custom Receipt'),
    )

    PAYMENT_METHODS = (
        ('CASH', 'Cash'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('MOBILE_MONEY', 'Mobile Money'),
        ('CREDIT_CARD', 'Credit Card'),
        ('DEBIT_CARD', 'Debit Card'),
        ('ONLINE', 'Online Payment'),
    )

    # Receipt details
    receipt_number = models.CharField(max_length=100, unique=True, db_index=True)
    receipt_type = models.CharField(max_length=50, choices=RECEIPT_TYPES)

    # Payer information
    payer_name = models.CharField(max_length=255)
    payer_email = models.EmailField(blank=True, null=True)
    payer_phone = models.CharField(max_length=20, blank=True, null=True)
    payer_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='receipts'
    )

    # Transaction details
    description = models.TextField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHODS)
    transaction_reference = models.CharField(max_length=255, blank=True, null=True)

    # Dates
    payment_date = models.DateTimeField(default=timezone.now)

    # Pin batch reference (if applicable)
    pin_batch = models.ForeignKey(
        PinBatch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='receipts'
    )

    # Campus and issuer
    campus = models.ForeignKey(
        Campus,
        on_delete=models.CASCADE,
        related_name='receipts'
    )
    issued_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='issued_receipts'
    )

    # Status
    is_cancelled = models.BooleanField(default=False)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cancelled_receipts'
    )
    cancellation_reason = models.TextField(blank=True, null=True)

    # Metadata
    metadata = models.JSONField(default=dict)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Receipt'
        verbose_name_plural = 'Receipts'
        indexes = [
            models.Index(fields=['receipt_number']),
            models.Index(fields=['receipt_type', 'campus']),
            models.Index(fields=['payer_user']),
            models.Index(fields=['payment_date']),
        ]

    def __str__(self):
        return f"{self.receipt_number} - {self.payer_name} - ${self.amount}"

    def save(self, *args, **kwargs):
        if not self.receipt_number:
            self.receipt_number = self.generate_receipt_number()
        super().save(*args, **kwargs)

    def generate_receipt_number(self):
        """Generate unique receipt number"""
        campus_code = self.campus.code if self.campus else 'SYS'
        date_code = timezone.now().strftime('%Y%m%d')
        random_code = ''.join(random.choices(string.digits, k=6))
        return f"RCP-{campus_code}-{date_code}-{random_code}"


class SalesReport(BaseModel):
    """
    Daily/Weekly/Monthly sales reports for business center
    """
    REPORT_TYPES = (
        ('DAILY', 'Daily Report'),
        ('WEEKLY', 'Weekly Report'),
        ('MONTHLY', 'Monthly Report'),
        ('QUARTERLY', 'Quarterly Report'),
        ('YEARLY', 'Yearly Report'),
    )

    report_type = models.CharField(max_length=50, choices=REPORT_TYPES)
    report_date = models.DateField()
    start_date = models.DateField()
    end_date = models.DateField()

    # Campus
    campus = models.ForeignKey(
        Campus,
        on_delete=models.CASCADE,
        related_name='sales_reports',
        null=True,
        blank=True
    )

    # Sales data
    total_pins_sold = models.IntegerField(default=0)
    total_pins_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_receipts_issued = models.IntegerField(default=0)
    total_receipts_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    # Breakdown by type
    sales_by_type = models.JSONField(default=dict)
    sales_by_method = models.JSONField(default=dict)

    # Generated by
    generated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='generated_sales_reports'
    )

    # File
    report_file = models.FileField(
        upload_to='business_center/reports/',
        null=True,
        blank=True
    )

    class Meta:
        ordering = ['-report_date']
        verbose_name = 'Sales Report'
        verbose_name_plural = 'Sales Reports'
        indexes = [
            models.Index(fields=['report_date', 'campus']),
            models.Index(fields=['report_type', 'campus']),
        ]
        unique_together = [['report_type', 'report_date', 'campus']]

    def __str__(self):
        return f"{self.get_report_type_display()} - {self.report_date}"


class PinVerification(BaseModel):
    """
    Track pin verification attempts
    """
    pin = models.ForeignKey(
        ApplicationPin,
        on_delete=models.CASCADE,
        related_name='verifications'
    )
    verified_by_email = models.EmailField(blank=True, null=True)
    verified_by_phone = models.CharField(max_length=20, blank=True, null=True)
    verification_ip = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    was_successful = models.BooleanField(default=False)
    failure_reason = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Pin Verification'
        verbose_name_plural = 'Pin Verifications'
        indexes = [
            models.Index(fields=['pin', 'created_at']),
            models.Index(fields=['verification_ip']),
        ]

    def __str__(self):
        return f"{self.pin.pin_number} - {'Success' if self.was_successful else 'Failed'}"
