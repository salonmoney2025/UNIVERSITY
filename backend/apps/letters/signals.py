"""
Letters Management Signals
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import GeneratedLetter, LetterLog


@receiver(pre_save, sender=GeneratedLetter)
def generate_reference_number(sender, instance, **kwargs):
    """Generate reference number for new letters"""
    if not instance.reference_number:
        instance.reference_number = instance.generate_reference_number()


@receiver(post_save, sender=GeneratedLetter)
def log_letter_creation(sender, instance, created, **kwargs):
    """Log letter creation"""
    if created:
        LetterLog.objects.create(
            letter=instance,
            action='CREATED',
            performed_by=instance.created_by,
            details={'status': instance.status}
        )
