'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import {
  Shield, Users, Key, Activity, Search, Filter,
  Check, X, Plus, Minus, AlertCircle, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
  requires_campus: boolean;
  requires_approval: boolean;
}

interface RolePermission {
  role: string;
  permissions: string[];
}

export default function PermissionManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>({});
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'matrix' | 'audit'>('matrix');

  const categories = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'ACADEMIC', label: 'Academic' },
    { value: 'FINANCE', label: 'Finance' },
    { value: 'ADMIN', label: 'Administration' },
    { value: 'STUDENT_SERVICES', label: 'Student Services' },
    { value: 'REGISTRY', label: 'Registry' },
    { value: 'HR', label: 'Human Resources' },
    { value: 'LIBRARY', label: 'Library' },
    { value: 'EXAMS', label: 'Examinations' },
  ];

  useEffect(() => {
    fetchPermissionMatrix();
  }, []);

  const fetchPermissionMatrix = async () => {
    try {
      const response = await api.get('/auth/rbac/check/matrix/');
      setPermissions(response.data.permissions);
      setMatrix(response.data.matrix);
      setRoles(response.data.roles);
    } catch (error) {
      console.error('Error fetching permission matrix:', error);
      toast.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = async (role: string, permissionCode: string, currentValue: boolean) => {
    try {
      if (currentValue) {
        // Revoke permission
        await api.post('/auth/rbac/role-permissions/revoke/', {
          role,
          permission_code: permissionCode,
          reason: 'Manual revoke via permission management UI'
        });
        toast.success(`Revoked ${permissionCode} from ${role}`);
      } else {
        // Grant permission
        await api.post('/auth/rbac/role-permissions/grant/', {
          role,
          permission_code: permissionCode,
          can_delegate: false,
          reason: 'Manual grant via permission management UI'
        });
        toast.success(`Granted ${permissionCode} to ${role}`);
      }

      // Refresh matrix
      await fetchPermissionMatrix();
    } catch (error: any) {
      console.error('Error toggling permission:', error);
      toast.error(error.response?.data?.error || 'Failed to update permission');
    }
  };

  const filteredPermissions = permissions.filter(perm => {
    const matchesCategory = selectedCategory === 'ALL' || perm.category === selectedCategory;
    const matchesSearch = perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         perm.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-portal-teal-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-portal-teal-600 to-portal-teal-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-12 w-12" />
              <div>
                <h1 className="text-3xl font-bold">Permission Management</h1>
                <p className="mt-1 text-portal-teal-100">
                  Manage role-based access control and permissions
                </p>
              </div>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <div className="text-sm text-portal-teal-100">Total Permissions</div>
              <div className="text-3xl font-bold">{permissions.length}</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Roles</p>
                <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Permissions</p>
                <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
              </div>
              <Key className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length - 1}</p>
              </div>
              <Filter className="h-10 w-10 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {permissions.filter(p => p.is_active).length}
                </p>
              </div>
              <Activity className="h-10 w-10 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('matrix')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'matrix'
                    ? 'border-portal-teal-600 text-portal-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Permission Matrix
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'audit'
                    ? 'border-portal-teal-600 text-portal-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Audit Logs
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'matrix' && (
              <>
                {/* Filters */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search permissions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Permission Matrix */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Permission
                        </th>
                        {roles.map(role => (
                          <th key={role} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {role.replace(/_/g, ' ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPermissions.map(permission => (
                        <tr key={permission.id} className="hover:bg-gray-50">
                          <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                              <div className="text-xs text-gray-500">{permission.code}</div>
                              {permission.requires_approval && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Requires Approval
                                </span>
                              )}
                            </div>
                          </td>
                          {roles.map(role => {
                            const hasPermission = matrix[role]?.[permission.code] || false;
                            return (
                              <td key={role} className="px-6 py-4 text-center">
                                <button
                                  onClick={() => togglePermission(role, permission.code, hasPermission)}
                                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                                    hasPermission
                                      ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                  }`}
                                  title={hasPermission ? 'Click to revoke' : 'Click to grant'}
                                >
                                  {hasPermission ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredPermissions.length === 0 && (
                  <div className="text-center py-12">
                    <Info className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No permissions found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search or filter criteria.
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'audit' && (
              <div className="text-center py-12">
                <Activity className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Audit Logs</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Permission audit logs will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
