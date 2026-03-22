'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  FileText,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit,
  X,
  Check,
  Clock,
  ArrowLeft,
  Mail,
  FileCheck,
  XCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Application {
  id: string;
  applicationId: string;
  applicantName: string;
  email: string;
  program: string;
  faculty: string;
  department: string;
  level: string;
  applicationDate: string;
  status: 'submitted' | 'under_review' | 'verified' | 'approved' | 'rejected';
  paymentStatus: 'paid' | 'unpaid' | 'partial' | 'exempted';
  documentStatus: 'complete' | 'incomplete' | 'pending';
}

const SAMPLE_APPLICATIONS: Application[] = [
  {
    id: '1',
    applicationId: 'APP2025001',
    applicantName: 'John Doe',
    email: 'john.doe@email.com',
    program: 'Computer Science',
    faculty: 'Science',
    department: 'Computer Science',
    level: '100',
    applicationDate: '2025-03-15',
    status: 'submitted',
    paymentStatus: 'paid',
    documentStatus: 'complete',
  },
  {
    id: '2',
    applicationId: 'APP2025002',
    applicantName: 'Jane Smith',
    email: 'jane.smith@email.com',
    program: 'Nursing',
    faculty: 'Medicine',
    department: 'Nursing',
    level: '100',
    applicationDate: '2025-03-16',
    status: 'under_review',
    paymentStatus: 'paid',
    documentStatus: 'pending',
  },
  {
    id: '3',
    applicationId: 'APP2025003',
    applicantName: 'Mike Johnson',
    email: 'mike.johnson@email.com',
    program: 'Civil Engineering',
    faculty: 'Engineering',
    department: 'Civil Engineering',
    level: '100',
    applicationDate: '2025-03-17',
    status: 'verified',
    paymentStatus: 'paid',
    documentStatus: 'complete',
  },
  {
    id: '4',
    applicationId: 'APP2025004',
    applicantName: 'Sarah Williams',
    email: 'sarah.williams@email.com',
    program: 'Accounting',
    faculty: 'Business Administration',
    department: 'Accounting',
    level: '100',
    applicationDate: '2025-03-18',
    status: 'approved',
    paymentStatus: 'paid',
    documentStatus: 'complete',
  },
];

const FACULTIES = [
  'All Faculties',
  'Science',
  'Engineering',
  'Arts',
  'Social Sciences',
  'Medicine',
  'Business Administration',
];

const STATUSES = [
  'All Statuses',
  'Submitted',
  'Under Review',
  'Verified',
  'Approved',
  'Rejected',
];

const PAYMENT_STATUSES = ['All', 'Paid', 'Unpaid', 'Partial', 'Exempted'];

const DOCUMENT_STATUSES = ['All', 'Complete', 'Incomplete', 'Pending Verification'];

export default function OnlineApplicationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('All Faculties');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('All');
  const [selectedDocumentStatus, setSelectedDocumentStatus] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredApplications = useMemo(() => {
    return SAMPLE_APPLICATIONS.filter((app) => {
      const matchesSearch =
        app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFaculty = selectedFaculty === 'All Faculties' || app.faculty === selectedFaculty;

      const matchesStatus =
        selectedStatus === 'All Statuses' ||
        app.status === selectedStatus.toLowerCase().replace(' ', '_');

      const matchesPayment =
        selectedPaymentStatus === 'All' ||
        app.paymentStatus === selectedPaymentStatus.toLowerCase();

      const matchesDocument =
        selectedDocumentStatus === 'All' ||
        app.documentStatus === selectedDocumentStatus.toLowerCase().replace(' ', '_');

      let matchesDate = true;
      if (dateFrom) {
        matchesDate = matchesDate && new Date(app.applicationDate) >= new Date(dateFrom);
      }
      if (dateTo) {
        matchesDate = matchesDate && new Date(app.applicationDate) <= new Date(dateTo);
      }

      return (
        matchesSearch &&
        matchesFaculty &&
        matchesStatus &&
        matchesPayment &&
        matchesDocument &&
        matchesDate
      );
    });
  }, [
    searchTerm,
    selectedFaculty,
    selectedStatus,
    selectedPaymentStatus,
    selectedDocumentStatus,
    dateFrom,
    dateTo,
  ]);

  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredApplications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApplications, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  const toggleApplicationSelection = (id: string) => {
    setSelectedApplications((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedApplications.length === paginatedApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(paginatedApplications.map((app) => app.id));
    }
  };

  const handleBulkApprove = () => {
    if (selectedApplications.length === 0) {
      toast.error('Please select applications to approve');
      return;
    }
    toast.success(`${selectedApplications.length} application(s) approved!`);
    setSelectedApplications([]);
  };

  const handleBulkReject = () => {
    if (selectedApplications.length === 0) {
      toast.error('Please select applications to reject');
      return;
    }
    toast.success(`${selectedApplications.length} application(s) rejected!`);
    setSelectedApplications([]);
  };

  const handleSendNotifications = () => {
    if (selectedApplications.length === 0) {
      toast.error('Please select applications to notify');
      return;
    }
    toast.success(`Notifications sent to ${selectedApplications.length} applicant(s)!`);
    setSelectedApplications([]);
  };

  const handleExport = () => {
    toast.success('Applications exported to Excel successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'verified':
        return 'bg-purple-100 text-purple-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-solid black-100 text-black';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'exempted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-solid black-100 text-black';
    }
  };

  const getDocumentColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'incomplete':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-solid black-100 text-black';
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-black mb-4">
            <Link
              href="/back-office"
              className="text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back Office
            </Link>
            <span className="text-black">/</span>
            <span className="text-black font-medium">Online Application Management</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black">Online Application Management</h1>
              <p className="text-black mt-1">
                Manage and monitor online application submissions
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <p className="text-sm text-black mb-1">Total Applications</p>
            <p className="text-2xl font-bold text-black">{filteredApplications.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-black mb-1">Under Review</p>
            <p className="text-2xl font-bold text-black">
              {filteredApplications.filter((a) => a.status === 'under_review').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
            <p className="text-sm text-black mb-1">Verified</p>
            <p className="text-2xl font-bold text-black">
              {filteredApplications.filter((a) => a.status === 'verified').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <p className="text-sm text-black mb-1">Approved</p>
            <p className="text-2xl font-bold text-black">
              {filteredApplications.filter((a) => a.status === 'approved').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
            <p className="text-sm text-black mb-1">Rejected</p>
            <p className="text-2xl font-bold text-black">
              {filteredApplications.filter((a) => a.status === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-black flex items-center gap-2">
              <Filter className="w-5 h-5 text-orange-600" />
              Filters
            </h2>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedFaculty('All Faculties');
                setSelectedStatus('All Statuses');
                setSelectedPaymentStatus('All');
                setSelectedDocumentStatus('All');
                setDateFrom('');
                setDateTo('');
              }}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ID, Name, or Email..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Faculty</label>
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {FACULTIES.map((faculty) => (
                    <option key={faculty} value={faculty}>
                      {faculty}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Application Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Payment Status
                </label>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {PAYMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Document Status
                </label>
                <select
                  value={selectedDocumentStatus}
                  onChange={(e) => setSelectedDocumentStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {DOCUMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedApplications.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <p className="text-sm font-medium text-blue-900">
              {selectedApplications.length} application(s) selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleBulkApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Approve Selected
              </button>
              <button
                onClick={handleBulkReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
              >
                <XCircle className="w-4 h-4" />
                Reject Selected
              </button>
              <button
                onClick={handleSendNotifications}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Mail className="w-4 h-4" />
                Send Notifications
              </button>
            </div>
          </div>
        )}

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-black">
              Applications ({filteredApplications.length})
            </h2>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Export to Excel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedApplications.length === paginatedApplications.length &&
                        paginatedApplications.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">
                    Application ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">
                    Applicant Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">
                    Application Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedApplications.includes(app.id)}
                        onChange={() => toggleApplicationSelection(app.id)}
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {app.applicationId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-black">{app.applicantName}</p>
                        <p className="text-xs text-black">{app.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-black">{app.program}</p>
                        <p className="text-xs text-black">{app.faculty}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentColor(
                          app.paymentStatus
                        )}`}
                      >
                        {app.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getDocumentColor(
                          app.documentStatus
                        )}`}
                      >
                        {app.documentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-700"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-700"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-700"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-700" title="Reject">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-black">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredApplications.length)} of{' '}
                {filteredApplications.length} applications
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-black hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                      currentPage === page
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'border-slate-300 text-black hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-black hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
