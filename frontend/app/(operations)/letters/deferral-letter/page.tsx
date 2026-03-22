'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Calendar, CheckCircle, XCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeferralRequest {
  id: string;
  studentId: string;
  name: string;
  course: string;
  originalIntake: string;
  requestedIntake: string;
  reason: string;
  submissionDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const DEFERRAL_REQUESTS: DeferralRequest[] = [
  {
    id: '1',
    studentId: 'STU2025010',
    name: 'ADAMA KAMARA',
    course: 'Bachelor of Science in Nursing',
    originalIntake: 'January 2025',
    requestedIntake: 'September 2025',
    reason: 'Medical reasons - require surgery and recovery time',
    submissionDate: '2025-01-05',
    status: 'Pending',
  },
  {
    id: '2',
    studentId: 'STU2025011',
    name: 'SORIE BANGURA',
    course: 'Master of Business Administration',
    originalIntake: 'January 2025',
    requestedIntake: 'January 2026',
    reason: 'Financial constraints - need more time to secure funding',
    submissionDate: '2025-01-08',
    status: 'Approved',
  },
  {
    id: '3',
    studentId: 'STU2025012',
    name: 'KADIATU SESAY',
    course: 'Bachelor of Science in Computer Science',
    originalIntake: 'January 2025',
    requestedIntake: 'September 2025',
    reason: 'Family emergency requiring immediate attention',
    submissionDate: '2025-01-10',
    status: 'Pending',
  },
];

export default function DeferralLetterPage() {
  const [requests] = useState(DEFERRAL_REQUESTS);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = filterStatus === 'All' || request.status === filterStatus;
    const matchesSearch =
      request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleApprove = (studentId: string, name: string) => {
    toast.success(`Deferral approved for ${name}`);
  };

  const handleReject = (studentId: string, name: string) => {
    toast.error(`Deferral rejected for ${name}`);
  };

  const handlePrintLetter = (studentId: string, name: string) => {
    toast.success(`Printing deferral letter for ${name}`);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      Approved: 'bg-green-100 text-green-700 border-green-300',
      Rejected: 'bg-red-100 text-red-700 border-red-300',
    };
    return styles[status as keyof typeof styles] || styles.Pending;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-black mb-4">
            <span className="text-black">Deferral Letters</span>
            <span className="text-black">/</span>
            <a href="/letters" className="text-blue-600 hover:text-blue-700">
              Letters
            </a>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-black">
              ADMISSION DEFERRAL MANAGEMENT
            </h1>
          </div>
          <p className="text-black">
            Process deferral requests and issue deferral letters
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-black">Pending Review</p>
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Deferral Requests */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-black">
                      {request.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-black">
                        <span className="font-medium">Student ID:</span>{' '}
                        {request.studentId}
                      </p>
                      <p className="text-sm text-black">
                        <span className="font-medium">Course:</span>{' '}
                        {request.course}
                      </p>
                      <p className="text-sm text-black">
                        <span className="font-medium">Submission Date:</span>{' '}
                        {request.submissionDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-black">
                        <span className="font-medium">Original Intake:</span>{' '}
                        {request.originalIntake}
                      </p>
                      <p className="text-sm text-black">
                        <span className="font-medium">Requested Intake:</span>{' '}
                        {request.requestedIntake}
                      </p>
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-orange-900 mb-2">
                      Reason for Deferral:
                    </p>
                    <p className="text-sm text-orange-800">{request.reason}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:w-48">
                  {request.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(request.studentId, request.name)}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.studentId, request.name)}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  {request.status === 'Approved' && (
                    <button
                      onClick={() =>
                        handlePrintLetter(request.studentId, request.name)
                      }
                      className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Print Letter
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredRequests.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Calendar className="w-16 h-16 text-black mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">
                No Deferral Requests
              </h3>
              <p className="text-black">
                No deferral requests match your search criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
