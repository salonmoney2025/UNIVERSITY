from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    UserViewSet,
    RegisterAPIView,
    LoginAPIView,
    LogoutAPIView,
    ChangePasswordAPIView,
    ResetPasswordAPIView,
    CurrentUserAPIView
)
from .bulk_views import BulkOperationsViewSet

app_name = 'authentication'

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'bulk', BulkOperationsViewSet, basename='bulk-operations')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),

    # Authentication endpoints
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Password management
    path('change-password/', ChangePasswordAPIView.as_view(), name='change_password'),
    path('reset-password/', ResetPasswordAPIView.as_view(), name='reset_password'),

    # Current user
    path('me/', CurrentUserAPIView.as_view(), name='current_user'),

    # RBAC - Role-Based Access Control
    path('rbac/', include('apps.authentication.rbac_urls')),

    # Approval Workflow System
    path('approvals/', include('apps.authentication.approval_urls')),

    # Session Management
    path('sessions/', include('apps.authentication.session_urls')),

    # Two-Factor Authentication
    path('2fa/', include('apps.authentication.twofa_urls')),
]
