"""
RBAC Serializers
API serializers for permission management
"""
from rest_framework import serializers
from .rbac_models import (
    Permission,
    RolePermission,
    UserPermission,
    PermissionAuditLog,
    RoleHierarchy
)
from .models import User


class PermissionSerializer(serializers.ModelSerializer):
    """Serializer for Permission model"""

    class Meta:
        model = Permission
        fields = [
            'id', 'code', 'name', 'description', 'category',
            'is_active', 'requires_campus', 'requires_approval',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RolePermissionSerializer(serializers.ModelSerializer):
    """Serializer for RolePermission model"""
    permission_details = PermissionSerializer(source='permission', read_only=True)
    granted_by_email = serializers.EmailField(source='granted_by.email', read_only=True)

    class Meta:
        model = RolePermission
        fields = [
            'id', 'role', 'permission', 'permission_details',
            'is_inherited', 'can_delegate',
            'granted_by', 'granted_by_email', 'granted_at',
            'created_at'
        ]
        read_only_fields = ['id', 'granted_at', 'created_at']


class UserPermissionSerializer(serializers.ModelSerializer):
    """Serializer for UserPermission model"""
    permission_details = PermissionSerializer(source='permission', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    granted_by_email = serializers.EmailField(source='granted_by.email', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = UserPermission
        fields = [
            'id', 'user', 'user_email', 'permission', 'permission_details',
            'action', 'granted_by', 'granted_by_email', 'reason',
            'expires_at', 'is_expired', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PermissionAuditLogSerializer(serializers.ModelSerializer):
    """Serializer for PermissionAuditLog model"""
    performed_by_email = serializers.EmailField(source='performed_by.email', read_only=True)
    permission_code = serializers.CharField(source='permission.code', read_only=True)
    affected_user_email = serializers.EmailField(source='affected_user.email', read_only=True)

    class Meta:
        model = PermissionAuditLog
        fields = [
            'id', 'performed_by', 'performed_by_email', 'action',
            'permission', 'permission_code',
            'affected_user', 'affected_user_email', 'affected_role',
            'reason', 'ip_address', 'user_agent',
            'old_value', 'new_value', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class RoleHierarchySerializer(serializers.ModelSerializer):
    """Serializer for RoleHierarchy model"""

    class Meta:
        model = RoleHierarchy
        fields = [
            'id', 'parent_role', 'child_role', 'inherit_all',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class GrantRolePermissionSerializer(serializers.Serializer):
    """Serializer for granting permission to a role"""
    permission_code = serializers.CharField(max_length=100)
    can_delegate = serializers.BooleanField(default=False)
    reason = serializers.CharField(required=False, allow_blank=True)


class RevokeRolePermissionSerializer(serializers.Serializer):
    """Serializer for revoking permission from a role"""
    permission_code = serializers.CharField(max_length=100)
    reason = serializers.CharField(required=False, allow_blank=True)


class GrantUserPermissionSerializer(serializers.Serializer):
    """Serializer for granting permission to a user"""
    user_id = serializers.UUIDField()
    permission_code = serializers.CharField(max_length=100)
    reason = serializers.CharField(required=False, allow_blank=True)
    expires_at = serializers.DateTimeField(required=False, allow_null=True)


class RevokeUserPermissionSerializer(serializers.Serializer):
    """Serializer for revoking permission from a user"""
    user_id = serializers.UUIDField()
    permission_code = serializers.CharField(max_length=100)
    reason = serializers.CharField(required=False, allow_blank=True)


class UserPermissionsResponseSerializer(serializers.Serializer):
    """Serializer for user permissions response"""
    user_id = serializers.UUIDField()
    email = serializers.EmailField()
    role = serializers.CharField()
    permissions = serializers.ListField(child=serializers.CharField())
    role_permissions = serializers.ListField(child=serializers.CharField())
    user_grants = serializers.ListField(child=serializers.CharField())
    user_revokes = serializers.ListField(child=serializers.CharField())


class PermissionMatrixSerializer(serializers.Serializer):
    """Serializer for permission matrix (roles x permissions)"""
    roles = serializers.ListField(child=serializers.CharField())
    permissions = PermissionSerializer(many=True)
    matrix = serializers.DictField(
        child=serializers.DictField(child=serializers.BooleanField())
    )


class BulkGrantPermissionsSerializer(serializers.Serializer):
    """Serializer for bulk granting permissions"""
    role = serializers.CharField(max_length=50)
    permission_codes = serializers.ListField(child=serializers.CharField())
    can_delegate = serializers.BooleanField(default=False)
    reason = serializers.CharField(required=False, allow_blank=True)


class BulkRevokePermissionsSerializer(serializers.Serializer):
    """Serializer for bulk revoking permissions"""
    role = serializers.CharField(max_length=50)
    permission_codes = serializers.ListField(child=serializers.CharField())
    reason = serializers.CharField(required=False, allow_blank=True)


class CloneRolePermissionsSerializer(serializers.Serializer):
    """Serializer for cloning permissions from one role to another"""
    source_role = serializers.CharField(max_length=50)
    target_role = serializers.CharField(max_length=50)
    overwrite = serializers.BooleanField(default=False)
    reason = serializers.CharField(required=False, allow_blank=True)
