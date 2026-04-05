/**
 * usePermission Hook
 * Check if current user has a specific permission
 */
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface PermissionCheck {
  hasPermission: boolean;
  loading: boolean;
  error: string | null;
}

export function usePermission(permissionCode: string): PermissionCheck {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const response = await api.post('/auth/rbac/check/check/', {
          permission_code: permissionCode
        });
        setHasPermission(response.data.has_permission);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to check permission');
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    if (permissionCode) {
      checkPermission();
    } else {
      setLoading(false);
    }
  }, [permissionCode]);

  return { hasPermission, loading, error };
}

/**
 * useMyPermissions Hook
 * Get all permissions for the current user
 */
export function useMyPermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await api.get('/auth/rbac/check/my_permissions/');
        setPermissions(response.data.permissions || []);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch permissions');
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const hasPermission = (permissionCode: string) => {
    return permissions.includes(permissionCode);
  };

  const hasAnyPermission = (permissionCodes: string[]) => {
    return permissionCodes.some(code => permissions.includes(code));
  };

  const hasAllPermissions = (permissionCodes: string[]) => {
    return permissionCodes.every(code => permissions.includes(code));
  };

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };
}
