"""
Business Center Utility Functions
"""
import random
import string
from .models import ApplicationPin


def generate_pin_number():
    """Generate a random PIN number"""
    return ''.join(random.choices(string.digits, k=12))


def generate_serial_number():
    """Generate a random serial number"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))


def generate_pins_for_batch(batch):
    """
    Generate individual pins for a batch
    """
    pins_to_create = []

    for _ in range(batch.quantity):
        # Generate unique pin and serial numbers
        pin_number = generate_pin_number()
        serial_number = generate_serial_number()

        # Ensure uniqueness
        while ApplicationPin.objects.filter(pin_number=pin_number).exists():
            pin_number = generate_pin_number()

        while ApplicationPin.objects.filter(serial_number=serial_number).exists():
            serial_number = generate_serial_number()

        pin = ApplicationPin(
            batch=batch,
            pin_number=pin_number,
            serial_number=serial_number,
            valid_until=batch.valid_until,
            status='UNUSED'
        )
        pins_to_create.append(pin)

    # Bulk create for performance
    ApplicationPin.objects.bulk_create(pins_to_create)

    return len(pins_to_create)


def verify_pin(pin_number, serial_number):
    """
    Verify if a pin exists and is valid
    Returns (success, message, pin_object or None)
    """
    from django.utils import timezone

    try:
        pin = ApplicationPin.objects.get(
            pin_number=pin_number,
            serial_number=serial_number
        )

        if pin.status == 'USED':
            return False, f"Pin has already been used on {pin.used_at}", None

        if pin.status == 'CANCELLED':
            return False, "Pin has been cancelled", None

        if timezone.now() > pin.valid_until:
            pin.status = 'EXPIRED'
            pin.save()
            return False, f"Pin expired on {pin.valid_until}", None

        return True, "Pin is valid and unused", pin

    except ApplicationPin.DoesNotExist:
        return False, "Invalid pin number or serial number", None


def generate_sales_report(report_type, start_date, end_date, campus=None):
    """
    Generate a sales report for the specified period
    """
    from django.db.models import Sum, Count, Q
    from .models import SalesReport, Receipt, ApplicationPin

    # Get all pins sold in the period
    pins_query = ApplicationPin.objects.filter(
        used_at__gte=start_date,
        used_at__lte=end_date,
        status='USED'
    )

    # Get all receipts in the period
    receipts_query = Receipt.objects.filter(
        payment_date__gte=start_date,
        payment_date__lte=end_date,
        is_cancelled=False
    )

    if campus:
        pins_query = pins_query.filter(batch__campus=campus)
        receipts_query = receipts_query.filter(campus=campus)

    # Calculate statistics
    total_pins_sold = pins_query.count()
    total_pins_revenue = sum(
        pin.batch.price_per_pin for pin in pins_query
    )

    total_receipts_issued = receipts_query.count()
    total_receipts_amount = receipts_query.aggregate(
        total=Sum('amount')
    )['total'] or 0

    # Sales by type
    sales_by_type = {}
    for pin_type in ApplicationPin.objects.filter(
        id__in=pins_query
    ).values_list('batch__pin_type', flat=True).distinct():
        count = pins_query.filter(batch__pin_type=pin_type).count()
        sales_by_type[pin_type] = count

    # Sales by payment method
    sales_by_method = {}
    for method in receipts_query.values_list('payment_method', flat=True).distinct():
        amount = receipts_query.filter(payment_method=method).aggregate(
            total=Sum('amount')
        )['total'] or 0
        sales_by_method[method] = float(amount)

    # Create report
    report = SalesReport.objects.create(
        report_type=report_type,
        report_date=end_date,
        start_date=start_date,
        end_date=end_date,
        campus=campus,
        total_pins_sold=total_pins_sold,
        total_pins_revenue=total_pins_revenue,
        total_receipts_issued=total_receipts_issued,
        total_receipts_amount=total_receipts_amount,
        total_revenue=total_pins_revenue + total_receipts_amount,
        sales_by_type=sales_by_type,
        sales_by_method=sales_by_method
    )

    return report
