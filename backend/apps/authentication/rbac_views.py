"""
RBAC API Views
Permission management endpoints for Super Admin
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.shortcuts import get_object_or_404

from .rbac_models import (
    Permission,
    RolePermission,
    UserPermission,
    PermissionAuditLog,
    RoleHierarchy
)
from .rbac_serializers import (
    PermissionSerializer,
    RolePermissionSerializer,
    UserPermissionSerializer,
    PermissionAuditLogSerializer,
    RoleHierarchySerializer,
    GrantRolePermissionSerializer,
    RevokeRolePermissionSerializer,
    GrantUserPermissionSerializer,
    RevokeUserPermissionSerializer,
    UserPermissionsResponseSerializer,
    PermissionMatrixSerializer,
    BulkGrantPermissionsSerializer,
    BulkRevokePermissionsSerializer,
    CloneRolePermissionsSerializer
)
from .rbac_utils import (
    PermissionChecker,
    grant_permission_to_role,
    revoke_permission_from_role,
    grant_permission_to_user,
    revoke_permission_from_user,
    log_permission_change
)
from .permissions import IsSuperAdmin
from .models import User


class PermissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing permissions
    Only Super Admin can create/update/delete permissions
    """
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    filterset_fields = ['category', 'is_active']
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['code', 'name', 'category', 'created_at']

    def perform_create(self, serializer):
        permission = serializer.save()
        log_permission_change(
            performed_by=self.request.user,
            action=PermissionAuditLog.PERMISSION_CREATED,
            permission=permission,
            reason=f"Permission {permission.code} created",
            request=self.request
        )

    def perform_update(self, serializer):
        old_data = {
            'code': serializer.instance.code,
            'name': serializer.instance.name,
            'is_active': serializer.instance.is_active
        }
        permission = serializer.save()
        log_permission_change(
            performed_by=self.request.user,
            action=PermissionAuditLog.PERMISSION_MODIFIED,
            permission=permission,
            reason=f"Permission {permission.code} updated",
            request=self.request,
            old_value=old_data,
            new_value={
                'code': permission.code,
                'name': permission.name,
                'is_active': permission.is_active
            }
        )

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get permissions grouped by category"""
        categories = {}
        for category_code, category_name in Permission.CATEGORY_CHOICES:
            permissions = Permission.objects.filter(
                category=category_code,
                is_active=True
            )
            categories[category_code] = {
                'name': category_name,
                'permissions': PermissionSerializer(permissions, many=True).data
            }
        return Response(categories)


class RolePermissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing role permissions
    """
    queryset = RolePermission.objects.all()
    serializer_class = RolePermissionSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    filterset_fields = ['role', 'is_inherited', 'can_delegate']

    @action(detail=False, methods=['post'])
    def grant(self, request):
        """Grant permission to a role"""
        serializer = GrantRolePermissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        role = request.data.get('role')
        success, message = grant_permission_to_role(
            role=role,
            permission_code=serializer.validated_data['permission_code'],
            granted_by=request.user,
            can_delegate=serializer.validated_data.get('can_delegate', False)
        )

        if success:
            return Response({'message': message}, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def revoke(self, request):
        """Revoke permission from a role"""
        serializer = RevokeRolePermissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        role = request.data.get('role')
        success, message = revoke_permission_from_role(
            role=role,
            permission_code=serializer.validated_data['permission_code'],
            revoked_by=request.user,
            reason=serializer.validated_data.get('reason')
        )

        if success:
            return Response({'message': message})
        else:
            return Response({'error': message}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def bulk_grant(self, request):
        """Grant multiple permissions to a role"""
        serializer = BulkGrantPermissionsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        role = serializer.validated_data['role']
        permission_codes = serializer.validated_data['permission_codes']
        can_delegate = serializer.validated_data.get('can_delegate', False)

        results = {'success': [], 'failed': []}

        with transaction.atomic():
            for perm_code in permission_codes:
                success, message = grant_permission_to_role(
                    role=role,
                    permission_code=perm_code,
                    granted_by=request.user,
                    can_delegate=can_delegate
                )
                if success:
                    results['success'].append(perm_code)
                else:
                    results['failed'].append({'code': perm_code, 'reason': message})

        return Response(results)

    @action(detail=False, methods=['post'])
    def bulk_revoke(self, request):
        """Revoke multiple permissions from a role"""
        serializer = BulkRevokePermissionsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        role = serializer.validated_data['role']
        permission_codes = serializer.validated_data['permission_codes']

        results = {'success': [], 'failed': []}

        with transaction.atomic():
            for perm_code in permission_codes:
                success, message = revoke_permission_from_role(
                    role=role,
                    permission_code=perm_code,
                    revoked_by=request.user,
                    reason=serializer.validated_data.get('reason')
                )
                if success:
                    results['success'].append(perm_code)
                else:
                    results['failed'].append({'code': perm_code, 'reason': message})

        return Response(results)

    @action(detail=False, methods=['post'])
    def clone(self, request):
        """Clone permissions from one role to another"""
        serializer = CloneRolePermissionsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        source_role = serializer.validated_data['source_role']
        target_role = serializer.validated_data['target_role']
        overwrite = serializer.validated_data.get('overwrite', False)

        # Get source role permissions
        source_perms = RolePermission.objects.filter(role=source_role)

        if not source_perms.exists():
            return Response(
                {'error': f'No permissions found for role {source_role}'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Delete existing target permissions if overwrite
        if overwrite:
            RolePermission.objects.filter(role=target_role).delete()

        # Clone permissions
        created_count = 0
        with transaction.atomic():
            for perm in source_perms:
                _, created = RolePermission.objects.get_or_create(
                    role=target_role,
                    permission=perm.permission,
                    defaults={
                        'granted_by': request.user,
                        'can_delegate': perm.can_delegate
                    }
                )
                if created:
                    created_count += 1

        log_permission_change(
            performed_by=request.user,
            action=PermissionAuditLog.ROLE_PERMISSION_GRANT,
            affected_role=target_role,
            reason=f"Cloned {created_count} permissions from {source_role}",
            request=request
        )

        return Response({
            'message': f'Cloned {created_count} permissions from {source_role} to {target_role}'
        })


class UserPermissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user-specific permissions
    """
    queryset = UserPermission.objects.all()
    serializer_class = UserPermissionSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    filterset_fields = ['user', 'action']

    @action(detail=False, methods=['post'])
    def grant(self, request):
        """Grant permission to a specific user"""
        serializer = GrantUserPermissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = get_object_or_404(User, id=serializer.validated_data['user_id'])
        success, message = grant_permission_to_user(
            user=user,
            permission_code=serializer.validated_data['permission_code'],
            granted_by=request.user,
            reason=serializer.validated_data.get('reason'),
            expires_at=serializer.validated_data.get('expires_at')
        )

        if success:
            return Response({'message': message}, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def revoke(self, request):
        """Revoke permission from a specific user"""
        serializer = RevokeUserPermissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = get_object_or_404(User, id=serializer.validated_data['user_id'])
        success, message = revoke_permission_from_user(
            user=user,
            permission_code=serializer.validated_data['permission_code'],
            revoked_by=request.user,
            reason=serializer.validated_data.get('reason')
        )

        if success:
            return Response({'message': message})
        else:
            return Response({'error': message}, status=status.HTTP_404_NOT_FOUND)


class PermissionCheckViewSet(viewsets.ViewSet):
    """
    ViewSet for checking permissions
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def check(self, request):
        """Check if user has a specific permission"""
        permission_code = request.data.get('permission_code')
        user_id = request.data.get('user_id', request.user.id)

        if not permission_code:
            return Response(
                {'error': 'permission_code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Only super admin can check other users
        if user_id != request.user.id and request.user.role != 'SUPER_ADMIN':
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        user = get_object_or_404(User, id=user_id)
        has_perm, source = PermissionChecker.has_permission(user, permission_code)

        return Response({
            'has_permission': has_perm,
            'source': source,
            'user_id': str(user.id),
            'permission_code': permission_code
        })

    @action(detail=False, methods=['get'])
    def my_permissions(self, request):
        """Get all permissions for current user"""
        permissions = PermissionChecker.get_user_permissions(request.user)
        return Response({
            'user_id': str(request.user.id),
            'email': request.user.email,
            'role': request.user.role,
            'permissions': permissions,
            'total': len(permissions)
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsSuperAdmin])
    def user_permissions(self, request):
        """Get all permissions for a specific user (Super Admin only)"""
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = get_object_or_404(User, id=user_id)
        permissions = PermissionChecker.get_user_permissions(user)

        # Get detailed breakdown
        role_perms = PermissionChecker._get_role_permissions_recursive(user.role)
        user_grants = UserPermission.objects.filter(
            user=user,
            action=UserPermission.GRANT
        ).values_list('permission__code', flat=True)
        user_revokes = UserPermission.objects.filter(
            user=user,
            action=UserPermission.REVOKE
        ).values_list('permission__code', flat=True)

        return Response({
            'user_id': str(user.id),
            'email': user.email,
            'role': user.role,
            'permissions': permissions,
            'role_permissions': list(role_perms),
            'user_grants': list(user_grants),
            'user_revokes': list(user_revokes),
            'total': len(permissions)
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsSuperAdmin])
    def matrix(self, request):
        """Get permission matrix (roles x permissions)"""
        from .models import User

        # Get all unique roles
        roles = User.objects.values_list('role', flat=True).distinct()

        # Get all permissions
        permissions = Permission.objects.filter(is_active=True)

        # Build matrix
        matrix = {}
        for role in roles:
            matrix[role] = {}
            for permission in permissions:
                has_perm, _ = PermissionChecker._check_role_permission(role, permission)
                matrix[role][permission.code] = has_perm

        return Response({
            'roles': list(roles),
            'permissions': PermissionSerializer(permissions, many=True).data,
            'matrix': matrix
        })


class PermissionAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing permission audit logs
    """
    queryset = PermissionAuditLog.objects.all()
    serializer_class = PermissionAuditLogSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    filterset_fields = ['performed_by', 'action', 'affected_user', 'affected_role']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent audit logs (last 100)"""
        logs = self.queryset.order_by('-created_at')[:100]
        serializer = self.get_serializer(logs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_user(self, request):
        """Get audit logs for a specific user"""
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        logs = self.queryset.filter(affected_user_id=user_id).order_by('-created_at')
        serializer = self.get_serializer(logs, many=True)
        return Response(serializer.data)
