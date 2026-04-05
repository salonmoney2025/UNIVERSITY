"""
URL routing for Session Management
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .session_views import (
    UserSessionViewSet,
    SessionActivityViewSet,
    LoginAttemptViewSet,
    DeviceFingerprintViewSet
)

router = DefaultRouter()
router.register(r'sessions', UserSessionViewSet, basename='user-session')
router.register(r'activities', SessionActivityViewSet, basename='session-activity')
router.register(r'login-attempts', LoginAttemptViewSet, basename='login-attempt')
router.register(r'devices', DeviceFingerprintViewSet, basename='device-fingerprint')

urlpatterns = [
    path('', include(router.urls)),
]
