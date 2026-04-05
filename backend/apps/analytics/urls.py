from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import AuditLogViewSet, SystemMetricViewSet, dashboard_statistics
from .analytics_views import AdvancedAnalyticsViewSet

app_name = 'analytics'

router = DefaultRouter()
router.register(r'audit-logs', AuditLogViewSet, basename='audit_log')
router.register(r'system-metrics', SystemMetricViewSet, basename='system_metric')
router.register(r'advanced', AdvancedAnalyticsViewSet, basename='advanced_analytics')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', dashboard_statistics, name='dashboard_statistics'),
]
