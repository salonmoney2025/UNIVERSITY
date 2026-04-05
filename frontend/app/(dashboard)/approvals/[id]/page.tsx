'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import {
  ArrowLeft, CheckCircle2, XCircle, MessageSquare,
  Clock, User, Calendar, FileText, AlertCircle,
  Send, ThumbsUp, ThumbsDown, Ban
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  status_display: string;
  current_level: number;
  request_data: any;
  submitted_at: string;
  completed_at: string | null;
  expires_at: string | null;
  submitted_by: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  approval_chain_details: {
    name: string;
    description: string;
    level_count: number;
  };
  actions: ApprovalAction[];
  comments: ApprovalComment[];
  current_approvers: any[];
  can_approve: boolean;
  progress_percentage: number;
}

interface ApprovalAction {
  id: string;
  level_number: number;
  approver: {
    first_name: string;
    last_name: string;
    email: string;
  };
  action: string;
  action_display: string;
  notes: string;
  acted_at: string;
}

interface ApprovalComment {
  id: string;
  user: {
    first_name: string;
    last_name: string;
  };
  comment: string;
  is_internal: boolean;
  created_at: string;
}

export default function ApprovalRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<ApprovalRequest | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [newComment, setNewComment] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [requestId]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/auth/approvals/requests/${requestId}/`);
      setRequest(response.data);
    } catch (error) {
      console.error('Error fetching request:', error);
      toast.error('Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!actionNotes.trim()) {
      toast.error('Please provide approval notes');
      return;
    }

    try {
      setProcessing(true);
      await api.post(`/auth/approvals/requests/${requestId}/approve/`, {
        action: 'APPROVED',
        notes: actionNotes
      });
      toast.success('Request approved successfully');
      setActionNotes('');
      await fetchRequest();
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error(error.response?.data?.error || 'Failed to approve request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!actionNotes.trim()) {
      toast.error('Please provide rejection reason');
      return;
    }

    if (!confirm('Are you sure you want to reject this request? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessing(true);
      await api.post(`/auth/approvals/requests/${requestId}/reject/`, {
        action: 'REJECTED',
        notes: actionNotes
      });
      toast.success('Request rejected');
      setActionNotes('');
      await fetchRequest();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error(error.response?.data?.error || 'Failed to reject request');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      setProcessing(true);
      await api.post(`/auth/approvals/requests/${requestId}/cancel/`, {
        reason
      });
      toast.success('Request cancelled');
      await fetchRequest();
    } catch (error: any) {
      console.error('Error cancelling request:', error);
      toast.error(error.response?.data?.error || 'Failed to cancel request');
    } finally {
      setProcessing(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await api.post(`/auth/approvals/requests/${requestId}/add_comment/`, {
        comment: newComment,
        is_internal: false
      });
      toast.success('Comment added');
      setNewComment('');
      await fetchRequest();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      APPROVED: 'bg-green-100 text-green-800 border-green-300',
      REJECTED: 'bg-red-100 text-red-800 border-red-300',
      CANCELLED: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!request) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Request not found</h3>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Approvals</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                  {request.status_display}
                </span>
                {request.can_approve && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-300">
                    Action Required
                  </span>
                )}
              </div>
              <p className="mt-2 text-gray-600">{request.description}</p>

              {/* Meta Info */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Submitted by</p>
                    <p className="font-medium">{request.submitted_by.first_name} {request.submitted_by.last_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Submitted</p>
                    <p className="font-medium">{new Date(request.submitted_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Workflow</p>
                    <p className="font-medium">{request.approval_chain_details.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Level</p>
                    <p className="font-medium">{request.current_level} of {request.approval_chain_details.level_count}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {request.status === 'PENDING' && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Approval Progress</span>
                    <span>{request.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-purple-600 h-3 rounded-full transition-all"
                      style={{ width: `${request.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Data */}
            {request.request_data && Object.keys(request.request_data).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Request Details</h2>
                <dl className="grid grid-cols-1 gap-4">
                  {Object.entries(request.request_data).map(([key, value]) => (
                    <div key={key} className="border-b pb-3">
                      <dt className="text-sm font-medium text-gray-500 capitalize">
                        {key.replace(/_/g, ' ')}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Action Buttons */}
            {request.can_approve && request.status === 'PENDING' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Take Action</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes / Comments <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Provide your decision notes..."
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleApprove}
                      disabled={processing || !actionNotes.trim()}
                      className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ThumbsUp className="h-5 w-5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={processing || !actionNotes.trim()}
                      className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ThumbsDown className="h-5 w-5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Comments & Discussion</h2>

              {/* Comment List */}
              <div className="space-y-4 mb-6">
                {request.comments.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No comments yet</p>
                ) : (
                  request.comments.map((comment) => (
                    <div key={comment.id} className="border-l-4 border-purple-300 pl-4 py-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.user.first_name} {comment.user.last_name}
                        </span>
                        <span className="text-gray-400 text-xs">•</span>
                        <span className="text-gray-500 text-xs">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                        {comment.is_internal && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            Internal
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{comment.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment */}
              {request.status === 'PENDING' && (
                <div className="border-t pt-4">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                      placeholder="Add a comment..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Approval History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Approval History</h2>
              <div className="space-y-4">
                {request.actions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No actions yet</p>
                ) : (
                  request.actions.map((action, index) => (
                    <div key={action.id} className="relative">
                      {index !== request.actions.length - 1 && (
                        <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200"></div>
                      )}
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          action.action === 'APPROVED' ? 'bg-green-100' :
                          action.action === 'REJECTED' ? 'bg-red-100' :
                          'bg-gray-100'
                        }`}>
                          {action.action === 'APPROVED' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : action.action === 'REJECTED' ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <MessageSquare className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {action.action_display}
                          </p>
                          <p className="text-xs text-gray-500">
                            Level {action.level_number} - {action.approver.first_name} {action.approver.last_name}
                          </p>
                          {action.notes && (
                            <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              {action.notes}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-gray-400">
                            {new Date(action.acted_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Current Approvers */}
            {request.status === 'PENDING' && request.current_approvers.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Current Approvers</h2>
                <div className="space-y-2">
                  {request.current_approvers.map((approver: any) => (
                    <div key={approver.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{approver.first_name} {approver.last_name}</p>
                        <p className="text-xs text-gray-500">{approver.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancel Button */}
            {request.status === 'PENDING' && (
              <button
                onClick={handleCancel}
                disabled={processing}
                className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                <Ban className="h-5 w-5" />
                <span>Cancel Request</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
