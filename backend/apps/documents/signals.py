"""
Document Signals - Automatic audit logging
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from .models import Document, DocumentVersion, DocumentShare, DocumentActivity


@receiver(post_save, sender=DocumentVersion)
def log_version_created(sender, instance, created, **kwargs):
    """Log when new version is created"""
    if created:
        # Activity already logged in views.py, but this is a backup
        pass


@receiver(post_save, sender=DocumentShare)
def log_share_created(sender, instance, created, **kwargs):
    """Log when document is shared"""
    if created:
        # Activity already logged in views.py
        pass
    else:
        # Log share update (expiration, permission change, etc.)
        if instance.accessed_ips and not kwargs.get('from_queryset'):
            DocumentActivity.objects.create(
                document=instance.document,
                user=instance.shared_with_user,
                action='view',
                details={'via_share': True}
            )


@receiver(post_delete, sender=DocumentShare)
def log_share_deleted(sender, instance, **kwargs):
    """Log when share is revoked"""
    DocumentActivity.objects.create(
        document=instance.document,
        user=instance.shared_by,
        action='unshare',
        details={'shared_with': str(instance.shared_with_user or instance.shared_with_group)}
    )
