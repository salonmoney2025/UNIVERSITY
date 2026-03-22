from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import AuditLogViewSet, SystemMetricViewSet, dashboard_statistics

app_name = 'analytics'

router = DefaultRouter()
router.register(r'audit-logs', AuditLogViewSet, basename='audit_log')
router.register(r'system-metrics', SystemMetricViewSet, basename='system_metric')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', dashboard_statistics, name='dashboard_statistics'),
]
