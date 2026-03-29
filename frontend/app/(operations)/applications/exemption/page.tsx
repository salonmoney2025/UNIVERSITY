'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FileSignature, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExemptionRequest {
  id: string;
  appId: string;
  name: string;
  program: string;
  exemptionType: 'Full Fee' | 'Partial Fee' | 'Application Fee';
  amount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const EXEMPTION_REQUESTS: ExemptionRequest[] = [
  {
    id: '1',
    appId: 'APP2025001',
    name: 'FATIMA BANGURA',
    program: 'BSc Nursing',
    exemptionType: 'Partial Fee',
    amount: 500000,
    reason: 'Financial hardship - single parent household',
    status: 'Pending',
  },
  {
    id: '2',
    appId: 'APP2025002',
    name: 'IBRAHIM MANSARAY',
    program: 'MBA',
    exemptionType: 'Full Fee',
    amount: 1500000,
    reason: 'Academic excellence scholarship',
    status: 'Approved',
  },
  {
    id: '3',
    appId: 'APP2025003',
    name: 'MARIAMA KAMARA',
    program: 'BSc Computer Science',
    exemptionType: 'Application Fee',
    amount: 50000,
    reason: 'Orphan status',
    status: 'Approved',
  },
];

export default function ApplicantsExemptionPage() {
  const [requests] = useState(EXEMPTION_REQUESTS);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredRequests = requests.filter(
    (req) => filterStatus === 'all' || req.status === filterStatus
  );

  const handleApprove = (appId: string, name: string) => {
    toast.success(`Exemption approved for ${name}`);
  };

  const handleReject = (appId: string, name: string) => {
    toast.error(`Exemption rejected for ${name}`);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      Approved: 'bg-green-100 text-green-700 border-green-300',
      Rejected: 'bg-red-100 text-red-700 border-red-300',
    };
    return styles[status as keyof typeof styles];
  };

  const getExemptionColor = (type: string) => {
    const colors = {
      'Full Fee': 'text-green-600',
      'Partial Fee': 'text-blue-600',
      'Application Fee': 'text-purple-600',
    };
    return colors[type as keyof typeof colors];
  };

  const formatAmount = (amount: number) => {
    return `NSL ${amount.toLocaleString()}`;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileSignature className="w-8 h-8 text-lime-600" />
            <h1 className="text-3xl font-bold text-black">APPLICANTS EXEMPTION</h1>
          </div>
          <p className="text-black">Manage fee exemptions and special considerations</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-sm font-medium text-black">Total Amount</p>
            <p className="text-2xl font-bold text-black mt-1">
              {formatAmount(requests.reduce((sum, r) => sum + r.amount, 0))}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Exemption Requests */}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <p className="text-sm text-black">
                      <span className="font-medium">App ID:</span> {request.appId}
                    </p>
                    <p className="text-sm text-black">
                      <span className="font-medium">Program:</span> {request.program}
                    </p>
                  </div>

                  {/* Exemption Details */}
                  <div className="bg-lime-50 border border-lime-200 rounded-lg p-4 mb-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-lime-700 font-medium mb-1">Exemption Type</p>
                        <p className={`text-sm font-semibold ${getExemptionColor(request.exemptionType)}`}>
                          {request.exemptionType}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-lime-700 font-medium mb-1">Amount</p>
                        <p className="text-sm text-lime-900 font-bold flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatAmount(request.amount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
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
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
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
