'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { HandshakeIcon, CheckCircle, Clock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface AcceptanceRecord {
  id: string;
  studentId: string;
  name: string;
  course: string;
  offerDate: string;
  acceptanceDeadline: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Expired';
}

const ACCEPTANCE_RECORDS: AcceptanceRecord[] = [
  {
    id: '1',
    studentId: 'STU2025001',
    name: 'LOVETTA MANSARAY',
    course: 'Bachelor of Science in Nursing',
    offerDate: '2025-01-10',
    acceptanceDeadline: '2025-02-10',
    status: 'Accepted',
  },
  {
    id: '2',
    studentId: 'STU2025002',
    name: 'MARIAMA KAMARA',
    course: 'Bachelor of Science in Computer Science',
    offerDate: '2025-01-12',
    acceptanceDeadline: '2025-02-12',
    status: 'Pending',
  },
  {
    id: '3',
    studentId: 'STU2025003',
    name: 'MOHAMED TURAY',
    course: 'Master of Business Administration',
    offerDate: '2025-01-15',
    acceptanceDeadline: '2025-02-15',
    status: 'Pending',
  },
  {
    id: '4',
    studentId: 'STU2025004',
    name: 'HAWA KOROMA',
    course: 'Bachelor of Science in Nursing',
    offerDate: '2025-01-08',
    acceptanceDeadline: '2025-02-08',
    status: 'Declined',
  },
];

export default function AcceptanceLetterPage() {
  const [records] = useState(ACCEPTANCE_RECORDS);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = records.filter((record) => {
    const matchesStatus = filterStatus === 'All' || record.status === filterStatus;
    const matchesSearch =
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSendReminder = (studentId: string, name: string) => {
    toast.success(`Reminder sent to ${name}`);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      Accepted: 'bg-green-100 text-green-700 border-green-300',
      Declined: 'bg-red-100 text-red-700 border-red-300',
      Expired: 'bg-solid black-100 text-black border-solid black-300',
    };
    return styles[status as keyof typeof styles] || styles.Pending;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-black mb-4">
            <span className="text-black">Acceptance Letters</span>
            <span className="text-black">/</span>
            <a href="/letters" className="text-blue-600 hover:text-blue-700">
              Letters
            </a>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <HandshakeIcon className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-black">
              OFFER ACCEPTANCE MANAGEMENT
            </h1>
          </div>
          <p className="text-black">
            Track and manage student offer acceptance status
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-black">Pending</p>
            <p className="text-3xl font-bold text-black mt-1">
              {records.filter((r) => r.status === 'Pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-black">Accepted</p>
            <p className="text-3xl font-bold text-black mt-1">
              {records.filter((r) => r.status === 'Accepted').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <p className="text-sm font-medium text-black">Declined</p>
            <p className="text-3xl font-bold text-black mt-1">
              {records.filter((r) => r.status === 'Declined').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-solid black-500">
            <p className="text-sm font-medium text-black">Expired</p>
            <p className="text-3xl font-bold text-black mt-1">
              {records.filter((r) => r.status === 'Expired').length}
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
                <option value="Expired">Expired</option>
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                    Offer Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-black">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`border-b border-slate-100 hover:bg-purple-50 transition ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-black font-medium">
                      {record.studentId}
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      {record.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      {record.course}
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      {record.offerDate}
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      {record.acceptanceDeadline}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                          record.status
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {record.status === 'Pending' && (
                        <button
                          onClick={() =>
                            handleSendReminder(record.studentId, record.name)
                          }
                          className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition text-sm font-medium"
                        >
                          <Mail className="w-4 h-4" />
                          Send Reminder
                        </button>
                      )}
                      {record.status === 'Accepted' && (
                        <span className="text-green-600 flex items-center justify-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Confirmed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="p-12 text-center">
              <HandshakeIcon className="w-16 h-16 text-black mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">
                No Records Found
              </h3>
              <p className="text-black">
                No acceptance records match your search criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
