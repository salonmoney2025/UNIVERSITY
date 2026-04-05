/**
 * PermissionGate Component
 * Conditionally render children based on user permissions
 */
'use client';

import { ReactNode } from 'react';
import { useMyPermissions } from '@/hooks/usePermission';

interface PermissionGateProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  loading?: ReactNode;
  children: ReactNode;
}

export default function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  loading: loadingComponent = null,
  children
}: PermissionGateProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission, loading } = useMyPermissions();

  if (loading && loadingComponent) {
    return <>{loadingComponent}</>;
  }

  if (loading) {
    return null;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    // No permission specified, allow access
    hasAccess = true;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Example Usage:
 *
 * // Single permission
 * <PermissionGate permission="VIEW_GRADES">
 *   <GradesTable />
 * </PermissionGate>
 *
 * // Multiple permissions (any)
 * <PermissionGate permissions={['ENTER_GRADES', 'APPROVE_GRADES']}>
 *   <GradeEntryForm />
 * </PermissionGate>
 *
 * // Multiple permissions (all required)
 * <PermissionGate permissions={['MANAGE_USERS', 'ASSIGN_ROLES']} requireAll>
 *   <UserManagement />
 * </PermissionGate>
 *
 * // With fallback
 * <PermissionGate
 *   permission="VIEW_FINANCE_REPORTS"
 *   fallback={<div>You don't have permission to view this</div>}
 * >
 *   <FinanceReports />
 * </PermissionGate>
 */
