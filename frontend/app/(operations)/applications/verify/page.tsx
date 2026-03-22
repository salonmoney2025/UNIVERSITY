'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { CheckCircle, XCircle, Eye, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Application {
  id: string;
  appId: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  appliedDate: string;
  status: 'pending' | 'incomplete' | 'complete';
  documents: {
    name: string;
    submitted: boolean;
  }[];
}

const APPLICATIONS: Application[] = [
  {
    id: '1',
    appId: 'APP2025001',
    name: 'FATIMA BANGURA',
    email: 'fatima@email.com',
    phone: '+232 77 123456',
    program: 'BSc Nursing',
    appliedDate: '2025-01-15',
    status: 'complete',
    documents: [
      { name: 'Birth Certificate', submitted: true },
      { name: 'WASSCE Results', submitted: true },
      { name: 'Passport Photo', submitted: true },
      { name: 'Medical Certificate', submitted: true },
    ],
  },
  {
    id: '2',
    appId: 'APP2025002',
    name: 'IBRAHIM MANS ARAY',
    email: 'ibrahim@email.com',
    phone: '+232 76 234567',
    program: 'MBA',
    appliedDate: '2025-01-16',
    status: 'incomplete',
    documents: [
      { name: 'Degree Certificate', submitted: true },
      { name: 'Transcript', submitted: false },
      { name: 'CV/Resume', submitted: true },
      { name: 'Reference Letters', submitted: false },
    ],
  },
  {
    id: '3',
    appId: 'APP2025003',
    name: 'MARIAMA KAMARA',
    email: 'mariama@email.com',
    phone: '+232 78 345678',
    program: 'BSc Computer Science',
    appliedDate: '2025-01-17',
    status: 'pending',
    documents: [
      { name: 'Birth Certificate', submitted: false },
      { name: 'WASSCE Results', submitted: false },
      { name: 'Passport Photo', submitted: false },
      { name: 'Medical Certificate', submitted: false },
    ],
  },
];

export default function VerifyApplicationsPage() {
  const [applications] = useState(APPLICATIONS);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
      const matchesSearch =
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.appId.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [applications, filterStatus, searchTerm]);

  const totalPages = Math.ceil(filteredApplications.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + entriesPerPage);

  const handleVerify = (appId: string, name: string) => {
    toast.success(`Application ${appId} verified for ${name}`);
  };

  const handleReject = (appId: string, name: string) => {
    toast.error(`Application ${appId} rejected for ${name}`);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      incomplete: 'bg-orange-100 text-orange-700 border-orange-300',
      complete: 'bg-green-100 text-green-700 border-green-300',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-black">VERIFY APPLICATIONS</h1>
          </div>
          <p className="text-black">Review and verify submitted applications</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-black">Pending Review</p>
            <p className="text-3xl font-bold text-black mt-1">
              {applications.filter((a) => a.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <p className="text-sm font-medium text-black">Incomplete</p>
            <p className="text-3xl font-bold text-black mt-1">
              {applications.filter((a) => a.status === 'incomplete').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-black">Complete</p>
            <p className="text-3xl font-bold text-black mt-1">
              {applications.filter((a) => a.status === 'complete').length}
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="all">All Applications</option>
                <option value="pending">Pending</option>
                <option value="incomplete">Incomplete</option>
                <option value="complete">Complete</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {paginatedApplications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-black">{app.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                        app.status
                      )}`}
                    >
                      {app.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    <p className="text-sm text-black">
                      <span className="font-medium">App ID:</span> {app.appId}
                    </p>
                    <p className="text-sm text-black">
                      <span className="font-medium">Program:</span> {app.program}
                    </p>
                    <p className="text-sm text-black">
                      <span className="font-medium">Email:</span> {app.email}
                    </p>
                    <p className="text-sm text-black">
                      <span className="font-medium">Applied:</span> {app.appliedDate}
                    </p>
                  </div>

                  {/* Documents Checklist */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-black mb-3">
                      Document Verification
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {app.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {doc.submitted ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span
                            className={`text-sm ${
                              doc.submitted ? 'text-green-700' : 'text-red-700'
                            }`}
                          >
                            {doc.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:w-48">
                  <button
                    onClick={() => handleVerify(app.appId, app.name)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Verify
                  </button>
                  <button
                    onClick={() => handleReject(app.appId, app.name)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}

          {paginatedApplications.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-black mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">No Applications Found</h3>
              <p className="text-black">No applications match your search criteria</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-black">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
