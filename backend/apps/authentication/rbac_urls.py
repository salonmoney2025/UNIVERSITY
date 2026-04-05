"""
RBAC URL Configuration
Routes for permission management APIs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .rbac_views import (
    PermissionViewSet,
    RolePermissionViewSet,
    UserPermissionViewSet,
    PermissionCheckViewSet,
    PermissionAuditLogViewSet
)

app_name = 'rbac'

router = DefaultRouter()
router.register(r'permissions', PermissionViewSet, basename='permission')
router.register(r'role-permissions', RolePermissionViewSet, basename='role-permission')
router.register(r'user-permissions', UserPermissionViewSet, basename='user-permission')
router.register(r'check', PermissionCheckViewSet, basename='permission-check')
router.register(r'audit-logs', PermissionAuditLogViewSet, basename='audit-log')

urlpatterns = [
    path('', include(router.urls)),
]
