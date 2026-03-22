"""
Business Center Signals
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from .models import PinBatch, ApplicationPin, Receipt


@receiver(pre_save, sender=PinBatch)
def check_batch_expiry(sender, instance, **kwargs):
    """Check if batch has expired and update status"""
    if timezone.now() > instance.valid_until and instance.status == 'ACTIVE':
        instance.status = 'EXPIRED'


@receiver(pre_save, sender=ApplicationPin)
def check_pin_expiry(sender, instance, **kwargs):
    """Check if pin has expired and update status"""
    if timezone.now() > instance.valid_until and instance.status == 'UNUSED':
        instance.status = 'EXPIRED'


@receiver(post_save, sender=Receipt)
def log_receipt_creation(sender, instance, created, **kwargs):
    """Log receipt creation for audit purposes"""
    if created:
        # Future: Add to audit log
        pass
