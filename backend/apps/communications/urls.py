from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import NotificationViewSet, SMSLogViewSet, EmailLogViewSet

app_name = 'communications'

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'sms-logs', SMSLogViewSet, basename='sms_log')
router.register(r'email-logs', EmailLogViewSet, basename='email_log')

urlpatterns = [
    path('', include(router.urls)),
]
