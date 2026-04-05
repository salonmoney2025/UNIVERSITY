'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import {
  Smartphone, Monitor, Tablet, MapPin, Clock,
  AlertTriangle, LogOut, CheckCircle, Shield,
  Globe, Calendar, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserSession {
  id: string;
  device_type: string;
  device_name: string;
  browser: string;
  browser_version: string;
  operating_system: string;
  os_version: string;
  ip_address: string;
  country: string;
  city: string;
  is_mobile: boolean;
  is_active: boolean;
  last_activity: string;
  expires_at: string;
  login_method_display: string;
  login_at: string;
  is_suspicious: boolean;
  is_current: boolean;
  is_expired: boolean;
}

interface SessionSummary {
  total_sessions: number;
  active_sessions: number;
  expired_sessions: number;
  suspicious_sessions: number;
  unique_devices: number;
  unique_locations: number;
  last_login: string;
  total_login_attempts: number;
  failed_login_attempts: number;
}

export default function SessionsPage() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchSummary();
  }, [showInactive]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const endpoint = showInactive
        ? '/auth/sessions/sessions/my_sessions/'
        : '/auth/sessions/sessions/active_sessions/';

      const response = await api.get(endpoint);
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get('/auth/sessions/sessions/summary/');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const terminateSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to terminate this session?')) {
      return;
    }

    try {
      await api.post(`/auth/sessions/sessions/${sessionId}/terminate/`);
      toast.success('Session terminated');
      await fetchSessions();
      await fetchSummary();
    } catch (error: any) {
      console.error('Error terminating session:', error);
      toast.error(error.response?.data?.error || 'Failed to terminate session');
    }
  };

  const terminateAllOthers = async () => {
    if (!confirm('This will log you out of all other devices. Continue?')) {
      return;
    }

    try {
      const response = await api.post('/auth/sessions/sessions/terminate_all/');
      toast.success(response.data.message);
      await fetchSessions();
      await fetchSummary();
    } catch (error) {
      console.error('Error terminating sessions:', error);
      toast.error('Failed to terminate sessions');
    }
  };

  const getDeviceIcon = (session: UserSession) => {
    if (session.is_mobile || session.device_type === 'Mobile') {
      return <Smartphone className="h-8 w-8 text-blue-500" />;
    } else if (session.device_type === 'Tablet') {
      return <Tablet className="h-8 w-8 text-purple-500" />;
    } else {
      return <Monitor className="h-8 w-8 text-gray-600" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && !summary) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-12 w-12" />
              <div>
                <h1 className="text-3xl font-bold">Active Sessions</h1>
                <p className="mt-1 text-blue-100">
                  Manage your devices and login sessions
                </p>
              </div>
            </div>
            <button
              onClick={terminateAllOthers}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout All Others</span>
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.active_sessions}</p>
                </div>
                <Activity className="h-10 w-10 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unique Devices</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.unique_devices}</p>
                </div>
                <Smartphone className="h-10 w-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Locations</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.unique_locations}</p>
                </div>
                <Globe className="h-10 w-10 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p className="text-sm font-medium text-gray-900">
                    {summary.last_login ? new Date(summary.last_login).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <Calendar className="h-10 w-10 text-orange-500" />
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show inactive sessions</span>
          </label>
        </div>

        {/* Sessions List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Sessions</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Shield className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">No sessions found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-6 ${session.is_current ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Device Icon */}
                      <div className="flex-shrink-0">
                        {getDeviceIcon(session)}
                      </div>

                      {/* Session Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {session.device_name || session.device_type || 'Unknown Device'}
                          </h3>
                          {session.is_current && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                              Current Session
                            </span>
                          )}
                          {session.is_suspicious && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium flex items-center space-x-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Suspicious</span>
                            </span>
                          )}
                          {!session.is_active && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                              Inactive
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Monitor className="h-4 w-4" />
                            <span>
                              {session.browser} {session.browser_version} on {session.operating_system}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {session.city ? `${session.city}, ${session.country}` : session.ip_address}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>Last active: {formatTimeAgo(session.last_activity)}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4" />
                            <span>Login: {session.login_method_display}</span>
                          </div>

                          <div className="col-span-2 text-xs text-gray-500">
                            IP: {session.ip_address} • Expires: {new Date(session.expires_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {session.is_active && !session.is_current && (
                      <button
                        onClick={() => terminateSession(session.id)}
                        className="ml-4 flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm">Logout</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Security Tips</h3>
              <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
                <li>Always log out when using shared or public computers</li>
                <li>Review your active sessions regularly</li>
                <li>Terminate suspicious or unrecognized sessions immediately</li>
                <li>Enable two-factor authentication for additional security</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
