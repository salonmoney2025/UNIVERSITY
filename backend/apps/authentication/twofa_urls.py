"""
URL Configuration for Two-Factor Authentication
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .twofa_views import TwoFactorAuthViewSet, TrustedDeviceViewSet

# Create router
router = DefaultRouter()
router.register(r'auth', TwoFactorAuthViewSet, basename='twofa')
router.register(r'devices', TrustedDeviceViewSet, basename='trusted-devices')

urlpatterns = [
    path('', include(router.urls)),
]
