"""
RBAC (Role-Based Access Control) Models
Dynamic permission system for EBKUST University Management System
"""
from django.db import models
from django.utils import timezone
from .models import BaseModel, User


class Permission(BaseModel):
    """
    Represents a specific function/action in the system
    Examples: VIEW_GRADES, SUBMIT_ASSIGNMENT, GENERATE_RECEIPT, etc.
    """
    # Module categories
    ACADEMIC = 'ACADEMIC'
    FINANCE = 'FINANCE'
    ADMIN = 'ADMIN'
    STUDENT_SERVICES = 'STUDENT_SERVICES'
    REGISTRY = 'REGISTRY'
    HR = 'HR'
    LIBRARY = 'LIBRARY'
    EXAMS = 'EXAMS'

    CATEGORY_CHOICES = (
        (ACADEMIC, 'Academic'),
        (FINANCE, 'Finance'),
        (ADMIN, 'Administration'),
        (STUDENT_SERVICES, 'Student Services'),
        (REGISTRY, 'Registry'),
        (HR, 'Human Resources'),
        (LIBRARY, 'Library'),
        (EXAMS, 'Examinations'),
    )

    # Permission details
    code = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        help_text="Unique code like VIEW_GRADES, SUBMIT_ASSIGNMENT"
    )
    name = models.CharField(max_length=200, help_text="Human-readable name")
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)

    # Metadata
    is_active = models.BooleanField(default=True)
    requires_campus = models.BooleanField(
        default=False,
        help_text="If True, user must have a campus assigned"
    )
    requires_approval = models.BooleanField(
        default=False,
        help_text="If True, action requires approval from higher authority"
    )

    class Meta:
        db_table = 'rbac_permissions'
        ordering = ['category', 'name']
        verbose_name = 'Permission'
        verbose_name_plural = 'Permissions'

    def __str__(self):
        return f"{self.code} - {self.name}"


class RolePermission(BaseModel):
    """
    Maps roles to permissions
    Defines what each role can do by default
    """
    role = models.CharField(
        max_length=50,
        db_index=True,
        help_text="Role name (STUDENT, LECTURER, etc.)"
    )
    permission = models.ForeignKey(
        Permission,
        on_delete=models.CASCADE,
        related_name='role_permissions'
    )

    # Optional constraints
    is_inherited = models.BooleanField(
        default=False,
        help_text="If True, this permission is inherited from parent role"
    )
    can_delegate = models.BooleanField(
        default=False,
        help_text="If True, users with this role can delegate this permission"
    )

    # Metadata
    granted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='granted_role_permissions'
    )
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'rbac_role_permissions'
        unique_together = ('role', 'permission')
        ordering = ['role', 'permission']
        verbose_name = 'Role Permission'
        verbose_name_plural = 'Role Permissions'

    def __str__(self):
        return f"{self.role} → {self.permission.code}"


class UserPermission(BaseModel):
    """
    User-specific permission overrides
    Can grant additional permissions or revoke role-based permissions
    """
    GRANT = 'GRANT'
    REVOKE = 'REVOKE'

    ACTION_CHOICES = (
        (GRANT, 'Grant Permission'),
        (REVOKE, 'Revoke Permission'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='custom_permissions'
    )
    permission = models.ForeignKey(
        Permission,
        on_delete=models.CASCADE,
        related_name='user_permissions'
    )
    action = models.CharField(
        max_length=10,
        choices=ACTION_CHOICES,
        help_text="GRANT = add permission, REVOKE = remove permission"
    )

    # Metadata
    granted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='granted_user_permissions'
    )
    reason = models.TextField(
        blank=True,
        null=True,
        help_text="Reason for granting/revoking this permission"
    )
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="If set, permission expires at this time"
    )

    class Meta:
        db_table = 'rbac_user_permissions'
        unique_together = ('user', 'permission')
        ordering = ['-created_at']
        verbose_name = 'User Permission'
        verbose_name_plural = 'User Permissions'

    def __str__(self):
        return f"{self.user.email} → {self.action} {self.permission.code}"

    def is_expired(self):
        """Check if this permission has expired"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False


class PermissionAuditLog(BaseModel):
    """
    Audit trail for all permission changes
    Tracks who changed what, when, and why
    """
    ROLE_PERMISSION_GRANT = 'ROLE_PERM_GRANT'
    ROLE_PERMISSION_REVOKE = 'ROLE_PERM_REVOKE'
    USER_PERMISSION_GRANT = 'USER_PERM_GRANT'
    USER_PERMISSION_REVOKE = 'USER_PERM_REVOKE'
    PERMISSION_CREATED = 'PERM_CREATED'
    PERMISSION_MODIFIED = 'PERM_MODIFIED'
    PERMISSION_DELETED = 'PERM_DELETED'

    ACTION_CHOICES = (
        (ROLE_PERMISSION_GRANT, 'Role Permission Granted'),
        (ROLE_PERMISSION_REVOKE, 'Role Permission Revoked'),
        (USER_PERMISSION_GRANT, 'User Permission Granted'),
        (USER_PERMISSION_REVOKE, 'User Permission Revoked'),
        (PERMISSION_CREATED, 'Permission Created'),
        (PERMISSION_MODIFIED, 'Permission Modified'),
        (PERMISSION_DELETED, 'Permission Deleted'),
    )

    # Who did what
    performed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='permission_actions'
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)

    # What was affected
    permission = models.ForeignKey(
        Permission,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    affected_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='permission_changes'
    )
    affected_role = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    # Context
    reason = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)

    # Data snapshot
    old_value = models.JSONField(
        null=True,
        blank=True,
        help_text="State before change"
    )
    new_value = models.JSONField(
        null=True,
        blank=True,
        help_text="State after change"
    )

    class Meta:
        db_table = 'rbac_audit_log'
        ordering = ['-created_at']
        verbose_name = 'Permission Audit Log'
        verbose_name_plural = 'Permission Audit Logs'
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['performed_by', '-created_at']),
            models.Index(fields=['affected_user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.performed_by} - {self.action} - {self.created_at}"


class RoleHierarchy(BaseModel):
    """
    Defines role inheritance hierarchy
    Child roles inherit permissions from parent roles
    """
    parent_role = models.CharField(
        max_length=50,
        db_index=True,
        help_text="Parent role that grants permissions"
    )
    child_role = models.CharField(
        max_length=50,
        db_index=True,
        help_text="Child role that inherits permissions"
    )
    inherit_all = models.BooleanField(
        default=True,
        help_text="If True, inherit ALL parent permissions"
    )

    class Meta:
        db_table = 'rbac_role_hierarchy'
        unique_together = ('parent_role', 'child_role')
        verbose_name = 'Role Hierarchy'
        verbose_name_plural = 'Role Hierarchies'

    def __str__(self):
        return f"{self.child_role} inherits from {self.parent_role}"
