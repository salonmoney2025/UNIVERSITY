'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import {
  ClipboardCheck, Clock, CheckCircle2, XCircle,
  AlertCircle, Search, Filter, Eye, Plus, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  status_display: string;
  current_level: number;
  submitted_at: string;
  submitted_by: {
    first_name: string;
    last_name: string;
    email: string;
  };
  approval_chain_details: {
    name: string;
    level_count: number;
  };
  progress_percentage: number;
  can_approve: boolean;
}

interface DashboardStats {
  pending_my_approval: number;
  my_pending_requests: number;
  my_approved_requests: number;
  my_rejected_requests: number;
  total_my_requests: number;
  recent_pending: ApprovalRequest[];
}

export default function ApprovalsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'pending_approval' | 'my_requests'>('pending_approval');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchDashboard();
    fetchRequests();
  }, [activeTab, statusFilter]);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/auth/approvals/requests/dashboard/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard');
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: any = { view: activeTab };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await api.get('/auth/approvals/requests/', { params });
      setRequests(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'APPROVED':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'CANCELLED':
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.PENDING}`}>
        {status}
      </span>
    );
  };

  const filteredRequests = requests.filter(req =>
    req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !stats) {
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
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ClipboardCheck className="h-12 w-12" />
              <div>
                <h1 className="text-3xl font-bold">Approval Workflows</h1>
                <p className="mt-1 text-purple-100">
                  Manage and track approval requests
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/approvals/new')}
              className="flex items-center space-x-2 bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>New Request</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending My Approval</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending_my_approval}</p>
                </div>
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">My Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.my_pending_requests}</p>
                </div>
                <Clock className="h-10 w-10 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.my_approved_requests}</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.my_rejected_requests}</p>
                </div>
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_my_requests}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-blue-500" />
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('pending_approval')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending_approval'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending My Approval ({stats?.pending_my_approval || 0})
              </button>
              <button
                onClick={() => setActiveTab('my_requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my_requests'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Requests ({stats?.total_my_requests || 0})
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Requests List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'pending_approval'
                    ? 'No approvals are pending your action.'
                    : 'You have not submitted any requests yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/approvals/${request.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(request.status)}
                          <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                          {getStatusBadge(request.status)}
                          {request.can_approve && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Action Required
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{request.description}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>Chain: {request.approval_chain_details.name}</span>
                          <span>•</span>
                          <span>Level {request.current_level} of {request.approval_chain_details.level_count}</span>
                          <span>•</span>
                          <span>Submitted by: {request.submitted_by.first_name} {request.submitted_by.last_name}</span>
                          <span>•</span>
                          <span>{new Date(request.submitted_at).toLocaleDateString()}</span>
                        </div>

                        {/* Progress Bar */}
                        {request.status === 'PENDING' && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{request.progress_percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all"
                                style={{ width: `${request.progress_percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/approvals/${request.id}`);
                        }}
                        className="ml-4 p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
