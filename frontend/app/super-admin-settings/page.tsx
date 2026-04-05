'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Shield,
  Settings,
  Database,
  Server,
  Users,
  Lock,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Home,
  LayoutDashboard,
  Trash2,
  Key,
  Cloud
} from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalStudents: number;
  totalStaff: number;
  databaseSize: string;
  serverUptime: string;
  apiRequests24h: number;
  averageResponseTime: string;
}

interface SecurityLog {
  id: string;
  timestamp: string;
  event: string;
  severity: 'info' | 'warning' | 'critical';
  user: string;
  ipAddress: string;
}

export default function SuperAdminSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const stats: SystemStats = {
    totalUsers: 1543,
    activeUsers: 892,
    totalStudents: 12845,
    totalStaff: 387,
    databaseSize: '45.2 GB',
    serverUptime: '45d 12h 34m',
    apiRequests24h: 156234,
    averageResponseTime: '145ms'
  };

  const securityLogs: SecurityLog[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      event: 'Failed login attempt',
      severity: 'warning',
      user: 'unknown',
      ipAddress: '192.168.1.100'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      event: 'Database backup completed',
      severity: 'info',
      user: 'system',
      ipAddress: 'localhost'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      event: 'Unauthorized API access attempt',
      severity: 'critical',
      user: 'admin123',
      ipAddress: '10.0.0.45'
    }
  ];

  // Check if user is super admin
  useEffect(() => {
    const checkSuperAdminAccess = () => {
      // This would normally check the user's role from auth context
      // For now, we'll assume the middleware has already verified
      console.log('Super Admin Settings page loaded');
    };
    checkSuperAdminAccess();
  }, []);

  const handleRefresh = () => {
    console.log('Refreshing system stats...');
    // Reload data from API
  };

  const getSeverityBadge = (severity: SecurityLog['severity']) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertTriangle className="h-3 w-3" />
            Critical
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <AlertTriangle className="h-3 w-3" />
            Warning
          </span>
        );
      case 'info':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <CheckCircle className="h-3 w-3" />
            Info
          </span>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Action Buttons Bar */}
        <div className="bg-white border-b border-gray-300 px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
            >
              <Home className="h-4 w-4" />
              HOME
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              DASHBOARD
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded font-medium transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              REFRESH
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 p-4 rounded-full">
              <Shield className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Super Admin Settings</h1>
              <p className="mt-1 text-red-100">
                System-wide configuration and monitoring - Restricted Access
              </p>
            </div>
          </div>
        </div>

        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-100 uppercase">Total Users</p>
                <p className="text-4xl font-bold mt-2">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-blue-100 mt-1">{stats.activeUsers} active</p>
              </div>
              <Users className="h-12 w-12 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-100 uppercase">Database Size</p>
                <p className="text-4xl font-bold mt-2">{stats.databaseSize}</p>
                <p className="text-sm text-green-100 mt-1">PostgreSQL</p>
              </div>
              <Database className="h-12 w-12 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-100 uppercase">Server Uptime</p>
                <p className="text-2xl font-bold mt-2">{stats.serverUptime}</p>
                <p className="text-sm text-purple-100 mt-1">99.98% uptime</p>
              </div>
              <Server className="h-12 w-12 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-100 uppercase">API Requests</p>
                <p className="text-3xl font-bold mt-2">{(stats.apiRequests24h / 1000).toFixed(1)}K</p>
                <p className="text-sm text-orange-100 mt-1">Last 24h</p>
              </div>
              <Activity className="h-12 w-12 opacity-50" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Overview
                </div>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'security'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Security Logs
                </div>
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'system'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  System Config
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">System Overview</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Average Response Time</span>
                        <span className="font-semibold text-gray-900">{stats.averageResponseTime}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">API Requests (24h)</span>
                        <span className="font-semibold text-gray-900">{stats.apiRequests24h.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Active Connections</span>
                        <span className="font-semibold text-gray-900">{stats.activeUsers}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">User Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Students</span>
                        <span className="font-semibold text-gray-900">{stats.totalStudents.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Staff</span>
                        <span className="font-semibold text-gray-900">{stats.totalStaff.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Active Users</span>
                        <span className="font-semibold text-gray-900">{stats.activeUsers}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-yellow-900">Super Admin Access</h3>
                      <p className="text-sm text-yellow-800 mt-1">
                        This page contains sensitive system configuration and monitoring tools.
                        All actions are logged and audited. Only SUPER_ADMIN users can access this page.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">Security & Audit Logs</h2>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-200 border-b-2 border-gray-400">
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 uppercase">Timestamp</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 uppercase">Event</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 uppercase">Severity</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 uppercase">IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {securityLogs.map((log) => (
                        <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{log.event}</td>
                          <td className="px-6 py-4">{getSeverityBadge(log.severity)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{log.user}</td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-600">{log.ipAddress}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">System Configuration</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Database Settings
                    </h3>
                    <div className="space-y-3">
                      <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors">
                        Run Database Backup
                      </button>
                      <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors">
                        Optimize Database
                      </button>
                      <button className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-medium transition-colors">
                        View Connection Pool
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      System Maintenance
                    </h3>
                    <div className="space-y-3">
                      <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors">
                        Clear System Cache
                      </button>
                      <button className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded font-medium transition-colors">
                        Restart Services
                      </button>
                      <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors">
                        <div className="flex items-center justify-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Emergency Shutdown
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
