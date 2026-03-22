from django.db import models
from apps.authentication.models import BaseModel


class AuditLog(BaseModel):
    user = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action = models.CharField(max_length=100)
    model_name = models.CharField(max_length=100, db_index=True)
    object_id = models.CharField(max_length=100)
    changes = models.JSONField(default=dict, help_text='JSON object containing changes made')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['model_name', 'object_id']),
            models.Index(fields=['action']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        user_display = self.user.email if self.user else 'Anonymous'
        return f"{user_display} - {self.action} - {self.model_name}"


class SystemMetric(BaseModel):
    metric_name = models.CharField(max_length=100, db_index=True)
    metric_value = models.DecimalField(max_digits=15, decimal_places=2)
    metric_type = models.CharField(max_length=50)
    campus = models.ForeignKey('campuses.Campus', on_delete=models.SET_NULL, null=True, blank=True, related_name='metrics')
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'System Metric'
        verbose_name_plural = 'System Metrics'
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['metric_name', 'recorded_at']),
            models.Index(fields=['campus', 'metric_name']),
            models.Index(fields=['recorded_at']),
        ]

    def __str__(self):
        return f"{self.metric_name}: {self.metric_value} ({self.recorded_at})"
