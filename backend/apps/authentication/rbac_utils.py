"""
RBAC Utility Functions
Permission checking, inheritance resolution, and audit logging
"""
from django.utils import timezone
from django.core.cache import cache
from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from .rbac_models import (
    Permission,
    RolePermission,
    UserPermission,
    PermissionAuditLog,
    RoleHierarchy
)


class PermissionChecker:
    """
    Main class for checking user permissions
    Implements caching for performance
    """

    @staticmethod
    def get_cache_key(user_id, permission_code):
        """Generate cache key for permission check"""
        return f"perm_{user_id}_{permission_code}"

    @classmethod
    def has_permission(cls, user, permission_code):
        """
        Check if user has a specific permission
        Considers: role permissions + user overrides + expiry
        Returns: (has_permission: bool, source: str)
        """
        if not user or not user.is_authenticated:
            return False, "not_authenticated"

        # Super Admin always has all permissions
        if user.role == 'SUPER_ADMIN':
            return True, "super_admin"

        # Check cache first
        cache_key = cls.get_cache_key(user.id, permission_code)
        cached_result = cache.get(cache_key)
        if cached_result is not None:
            return cached_result

        # Get permission object
        try:
            permission = Permission.objects.get(code=permission_code, is_active=True)
        except Permission.DoesNotExist:
            return False, "permission_not_found"

        # Check if permission requires campus and user has none
        if permission.requires_campus and not user.campus:
            return False, "no_campus"

        # 1. Check user-specific overrides first (highest priority)
        user_perm = UserPermission.objects.filter(
            user=user,
            permission=permission
        ).first()

        if user_perm:
            # Check if expired
            if user_perm.is_expired():
                return False, "permission_expired"

            # REVOKE overrides everything
            if user_perm.action == UserPermission.REVOKE:
                result = (False, "user_revoked")
            # GRANT gives permission
            elif user_perm.action == UserPermission.GRANT:
                result = (True, "user_granted")
        else:
            # 2. Check role-based permissions (with inheritance)
            has_role_perm = cls._check_role_permission(user.role, permission)
            if has_role_perm:
                result = (True, "role_permission")
            else:
                result = (False, "no_permission")

        # Cache result for 5 minutes
        cache.set(cache_key, result, 300)
        return result

    @classmethod
    def _check_role_permission(cls, role, permission):
        """
        Check if role has permission (considering inheritance)
        """
        # Direct role permission
        if RolePermission.objects.filter(
            role=role,
            permission=permission
        ).exists():
            return True

        # Check inherited permissions
        parent_roles = RoleHierarchy.objects.filter(
            child_role=role,
            inherit_all=True
        ).values_list('parent_role', flat=True)

        if parent_roles:
            for parent_role in parent_roles:
                if cls._check_role_permission(parent_role, permission):
                    return True

        return False

    @classmethod
    def get_user_permissions(cls, user):
        """
        Get all effective permissions for a user
        Returns list of permission codes
        """
        if user.role == 'SUPER_ADMIN':
            # Super admin has all permissions
            return list(Permission.objects.filter(
                is_active=True
            ).values_list('code', flat=True))

        permissions = set()

        # Get role permissions (with inheritance)
        role_perms = cls._get_role_permissions_recursive(user.role)
        permissions.update(role_perms)

        # Apply user-specific overrides
        user_overrides = UserPermission.objects.filter(
            user=user
        ).select_related('permission')

        for override in user_overrides:
            # Skip expired permissions
            if override.is_expired():
                continue

            if override.action == UserPermission.GRANT:
                permissions.add(override.permission.code)
            elif override.action == UserPermission.REVOKE:
                permissions.discard(override.permission.code)

        return list(permissions)

    @classmethod
    def _get_role_permissions_recursive(cls, role, visited=None):
        """
        Get all permissions for a role including inherited ones
        """
        if visited is None:
            visited = set()

        if role in visited:
            return set()  # Prevent infinite loops

        visited.add(role)
        permissions = set()

        # Get direct permissions
        direct_perms = RolePermission.objects.filter(
            role=role
        ).select_related('permission').values_list('permission__code', flat=True)
        permissions.update(direct_perms)

        # Get inherited permissions
        parent_roles = RoleHierarchy.objects.filter(
            child_role=role,
            inherit_all=True
        ).values_list('parent_role', flat=True)

        for parent_role in parent_roles:
            parent_perms = cls._get_role_permissions_recursive(parent_role, visited)
            permissions.update(parent_perms)

        return permissions

    @classmethod
    def clear_user_cache(cls, user_id):
        """Clear all cached permissions for a user"""
        # This is a simple implementation
        # In production, use cache key patterns
        cache.delete_pattern(f"perm_{user_id}_*")

    @classmethod
    def clear_role_cache(cls, role):
        """Clear cached permissions for all users with a role"""
        from .models import User
        users = User.objects.filter(role=role).values_list('id', flat=True)
        for user_id in users:
            cls.clear_user_cache(user_id)


def require_permission(permission_code, raise_exception=True):
    """
    Decorator to require specific permission for view access
    Usage: @require_permission('VIEW_GRADES')
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            has_perm, source = PermissionChecker.has_permission(
                request.user,
                permission_code
            )

            if not has_perm:
                if raise_exception:
                    return Response({
                        'error': 'Permission denied',
                        'required_permission': permission_code,
                        'reason': source
                    }, status=status.HTTP_403_FORBIDDEN)
                else:
                    # Add permission info to request but don't block
                    request.permission_check = {
                        'has_permission': False,
                        'source': source
                    }

            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def log_permission_change(performed_by, action, permission=None, affected_user=None,
                          affected_role=None, reason=None, request=None,
                          old_value=None, new_value=None):
    """
    Create an audit log entry for permission changes
    """
    ip_address = None
    user_agent = None

    if request:
        # Get client IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')

        # Get user agent
        user_agent = request.META.get('HTTP_USER_AGENT', '')

    log_entry = PermissionAuditLog.objects.create(
        performed_by=performed_by,
        action=action,
        permission=permission,
        affected_user=affected_user,
        affected_role=affected_role,
        reason=reason,
        ip_address=ip_address,
        user_agent=user_agent,
        old_value=old_value,
        new_value=new_value
    )

    return log_entry


def grant_permission_to_role(role, permission_code, granted_by, can_delegate=False):
    """
    Grant a permission to a role
    """
    try:
        permission = Permission.objects.get(code=permission_code, is_active=True)
    except Permission.DoesNotExist:
        return False, "Permission not found"

    role_perm, created = RolePermission.objects.get_or_create(
        role=role,
        permission=permission,
        defaults={
            'granted_by': granted_by,
            'can_delegate': can_delegate
        }
    )

    if created:
        log_permission_change(
            performed_by=granted_by,
            action=PermissionAuditLog.ROLE_PERMISSION_GRANT,
            permission=permission,
            affected_role=role,
            reason=f"Permission granted to role {role}"
        )
        PermissionChecker.clear_role_cache(role)
        return True, "Permission granted"
    else:
        return False, "Permission already exists"


def revoke_permission_from_role(role, permission_code, revoked_by, reason=None):
    """
    Revoke a permission from a role
    """
    try:
        permission = Permission.objects.get(code=permission_code)
        role_perm = RolePermission.objects.get(role=role, permission=permission)
    except (Permission.DoesNotExist, RolePermission.DoesNotExist):
        return False, "Permission or role permission not found"

    role_perm.delete()

    log_permission_change(
        performed_by=revoked_by,
        action=PermissionAuditLog.ROLE_PERMISSION_REVOKE,
        permission=permission,
        affected_role=role,
        reason=reason or f"Permission revoked from role {role}"
    )

    PermissionChecker.clear_role_cache(role)
    return True, "Permission revoked"


def grant_permission_to_user(user, permission_code, granted_by, reason=None, expires_at=None):
    """
    Grant a permission to a specific user (override)
    """
    try:
        permission = Permission.objects.get(code=permission_code, is_active=True)
    except Permission.DoesNotExist:
        return False, "Permission not found"

    user_perm, created = UserPermission.objects.update_or_create(
        user=user,
        permission=permission,
        defaults={
            'action': UserPermission.GRANT,
            'granted_by': granted_by,
            'reason': reason,
            'expires_at': expires_at
        }
    )

    log_permission_change(
        performed_by=granted_by,
        action=PermissionAuditLog.USER_PERMISSION_GRANT,
        permission=permission,
        affected_user=user,
        reason=reason
    )

    PermissionChecker.clear_user_cache(user.id)
    return True, "Permission granted to user"


def revoke_permission_from_user(user, permission_code, revoked_by, reason=None):
    """
    Revoke a permission from a specific user
    """
    try:
        permission = Permission.objects.get(code=permission_code)
    except Permission.DoesNotExist:
        return False, "Permission not found"

    UserPermission.objects.update_or_create(
        user=user,
        permission=permission,
        defaults={
            'action': UserPermission.REVOKE,
            'granted_by': revoked_by,
            'reason': reason
        }
    )

    log_permission_change(
        performed_by=revoked_by,
        action=PermissionAuditLog.USER_PERMISSION_REVOKE,
        permission=permission,
        affected_user=user,
        reason=reason
    )

    PermissionChecker.clear_user_cache(user.id)
    return True, "Permission revoked from user"
