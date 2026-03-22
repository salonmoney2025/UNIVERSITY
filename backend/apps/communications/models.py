from django.db import models
from apps.authentication.models import BaseModel


class Notification(BaseModel):
    INFO, WARNING, ALERT, ANNOUNCEMENT = 'INFO', 'WARNING', 'ALERT', 'ANNOUNCEMENT'
    LOW, MEDIUM, HIGH, URGENT = 'LOW', 'MEDIUM', 'HIGH', 'URGENT'

    recipient_user = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='notifications_received')
    sender_user = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications_sent')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, default=INFO, db_index=True)
    priority = models.CharField(max_length=20, default=MEDIUM)
    is_read = models.BooleanField(default=False, db_index=True)
    sent_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-sent_at']
        indexes = [
            models.Index(fields=['recipient_user', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['sent_at']),
        ]

    def __str__(self):
        return f"{self.title} - {self.recipient_user.email}"


class SMSLog(BaseModel):
    PENDING, SENT, FAILED, DELIVERED = 'PENDING', 'SENT', 'FAILED', 'DELIVERED'

    recipient_phone = models.CharField(max_length=17)
    message = models.TextField()
    status = models.CharField(max_length=20, default=PENDING, db_index=True)
    sent_at = models.DateTimeField(auto_now_add=True)
    gateway_response = models.JSONField(default=dict, blank=True)
    cost = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    class Meta:
        verbose_name = 'SMS Log'
        verbose_name_plural = 'SMS Logs'
        ordering = ['-sent_at']
        indexes = [
            models.Index(fields=['recipient_phone']),
            models.Index(fields=['status']),
            models.Index(fields=['sent_at']),
        ]

    def __str__(self):
        return f"{self.recipient_phone} - {self.status}"


class EmailLog(BaseModel):
    PENDING, SENT, FAILED, DELIVERED = 'PENDING', 'SENT', 'FAILED', 'DELIVERED'

    recipient_email = models.EmailField()
    subject = models.CharField(max_length=200)
    body = models.TextField()
    status = models.CharField(max_length=20, default=PENDING, db_index=True)
    sent_at = models.DateTimeField(auto_now_add=True)
    opened_at = models.DateTimeField(null=True, blank=True)
    clicked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Email Log'
        verbose_name_plural = 'Email Logs'
        ordering = ['-sent_at']
        indexes = [
            models.Index(fields=['recipient_email']),
            models.Index(fields=['status']),
            models.Index(fields=['sent_at']),
        ]

    def __str__(self):
        return f"{self.recipient_email} - {self.subject}"
