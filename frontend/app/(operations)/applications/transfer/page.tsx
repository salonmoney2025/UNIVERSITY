'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { RefreshCw, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface TransferRequest {
  id: string;
  appId: string;
  name: string;
  fromProgram: string;
  toProgram: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const TRANSFER_REQUESTS: TransferRequest[] = [
  {
    id: '1',
    appId: 'APP2025001',
    name: 'FATIMA BANGURA',
    fromProgram: 'BSc Nursing',
    toProgram: 'BSc Microbiology',
    reason: 'Change of career interest',
    status: 'Pending',
  },
  {
    id: '2',
    appId: 'APP2025002',
    name: 'IBRAHIM MANSARAY',
    fromProgram: 'MBA',
    toProgram: 'MSc Management',
    reason: 'Better fit for career goals',
    status: 'Approved',
  },
];

export default function TransferApplicantsPage() {
  const [requests] = useState(TRANSFER_REQUESTS);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredRequests = requests.filter(
    (req) => filterStatus === 'all' || req.status === filterStatus
  );

  const handleApprove = (appId: string, name: string) => {
    toast.success(`Transfer approved for ${name}`);
  };

  const handleReject = (appId: string, name: string) => {
    toast.error(`Transfer rejected for ${name}`);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      Approved: 'bg-green-100 text-green-700 border-green-300',
      Rejected: 'bg-red-100 text-red-700 border-red-300',
    };
    return styles[status as keyof typeof styles];
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <RefreshCw className="w-8 h-8 text-violet-600" />
            <h1 className="text-3xl font-bold text-black">TRANSFER APPLICANTS</h1>
          </div>
          <p className="text-black">Transfer applicants between programs or courses</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-black">Pending</p>
            <p className="text-3xl font-bold text-black mt-1">
              {requests.filter((r) => r.status === 'Pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-black">Approved</p>
            <p className="text-3xl font-bold text-black mt-1">
              {requests.filter((r) => r.status === 'Approved').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <p className="text-sm font-medium text-black">Rejected</p>
            <p className="text-3xl font-bold text-black mt-1">
              {requests.filter((r) => r.status === 'Rejected').length}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Transfer Requests */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-black">{request.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <p className="text-sm text-black mb-3">
                    <span className="font-medium">App ID:</span> {request.appId}
                  </p>

                  {/* Transfer Details */}
                  <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-3">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-violet-700 font-medium mb-1">From</p>
                        <p className="text-sm text-violet-900 font-semibold">
                          {request.fromProgram}
                        </p>
                      </div>
                      <ArrowRight className="w-6 h-6 text-violet-600" />
                      <div className="flex-1">
                        <p className="text-xs text-violet-700 font-medium mb-1">To</p>
                        <p className="text-sm text-violet-900 font-semibold">
                          {request.toProgram}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-black mb-1">Reason:</p>
                    <p className="text-sm text-black">{request.reason}</p>
                  </div>
                </div>

                {/* Actions */}
                {request.status === 'Pending' && (
                  <div className="flex flex-col gap-2 lg:w-48">
                    <button
                      onClick={() => handleApprove(request.appId, request.name)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.appId, request.name)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
