'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BookCheck, Eye, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface Examination {
  id: string;
  examType: string;
  studentId: string;
  studentName: string;
  examDate: string;
  score: number;
  status: 'Passed' | 'Failed' | 'Pending';
}

const EXAMINATIONS: Examination[] = [
  {
    id: '1',
    examType: 'Entrance Exam',
    studentId: 'APP2025001',
    studentName: 'FATIMA BANGURA',
    examDate: '2025-01-20',
    score: 85,
    status: 'Passed',
  },
  {
    id: '2',
    examType: 'Interview',
    studentId: 'APP2025002',
    studentName: 'IBRAHIM MANSARAY',
    examDate: '2025-01-21',
    score: 78,
    status: 'Passed',
  },
  {
    id: '3',
    examType: 'Aptitude Test',
    studentId: 'APP2025003',
    studentName: 'MARIAMA KAMARA',
    examDate: '2025-01-22',
    score: 45,
    status: 'Failed',
  },
  {
    id: '4',
    examType: 'Entrance Exam',
    studentId: 'APP2025004',
    studentName: 'ABDUL SESAY',
    examDate: '2025-01-23',
    score: 0,
    status: 'Pending',
  },
];

const EXAM_TYPES = ['All', 'Entrance Exam', 'Interview', 'Aptitude Test', 'Practical Test'];

export default function ViewExaminationsPage() {
  const [selectedExamType, setSelectedExamType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExams = EXAMINATIONS.filter((exam) => {
    const matchesType = selectedExamType === 'All' || exam.examType === selectedExamType;
    const matchesStatus = selectedStatus === 'All' || exam.status === selectedStatus;
    const matchesSearch =
      exam.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const handleViewDetails = (studentId: string) => {
    toast.success(`Viewing details for ${studentId}`);
  };

  const handleExport = () => {
    toast.success('Exporting examination records...');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Passed: 'bg-green-100 text-green-700 border-green-300',
      Failed: 'bg-red-100 text-red-700 border-red-300',
      Pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    };
    return styles[status as keyof typeof styles];
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 font-bold';
    if (score >= 50) return 'text-yellow-600 font-bold';
    if (score > 0) return 'text-red-600 font-bold';
    return 'text-black font-bold';
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookCheck className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-black">VIEW OTHER EXAMINATIONS</h1>
          </div>
          <p className="text-black">Manage and view special examinations and test results</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-black">Passed</p>
            <p className="text-3xl font-bold text-black mt-1">
              {EXAMINATIONS.filter((e) => e.status === 'Passed').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <p className="text-sm font-medium text-black">Failed</p>
            <p className="text-3xl font-bold text-black mt-1">
              {EXAMINATIONS.filter((e) => e.status === 'Failed').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-black">Pending</p>
            <p className="text-3xl font-bold text-black mt-1">
              {EXAMINATIONS.filter((e) => e.status === 'Pending').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Exam Type</label>
              <select
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              >
                {EXAM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Passed">Passed</option>
                <option value="Failed">Failed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleExport}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Results
            </button>
          </div>
        </div>

        {/* Examinations Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                    Exam Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                    Exam Date
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-black">
                    Score
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-black">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-black">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam, index) => (
                  <tr
                    key={exam.id}
                    className={`border-b border-slate-100 hover:bg-orange-50 transition ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-black font-medium">
                      {exam.studentId}
                    </td>
                    <td className="px-6 py-4 text-sm text-black">{exam.studentName}</td>
                    <td className="px-6 py-4 text-sm text-black">{exam.examType}</td>
                    <td className="px-6 py-4 text-sm text-black">{exam.examDate}</td>
                    <td className={`px-6 py-4 text-sm text-center ${getScoreColor(exam.score)}`}>
                      {exam.score > 0 ? `${exam.score}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                          exam.status
                        )}`}
                      >
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewDetails(exam.studentId)}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
