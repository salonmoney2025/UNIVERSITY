'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BarChart3, Users, TrendingUp, FileText, Download, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProgramStats {
  program: string;
  total: number;
  pending: number;
  verified: number;
  admitted: number;
  rejected: number;
}

const PROGRAM_STATS: ProgramStats[] = [
  {
    program: 'Bachelor of Science in Nursing',
    total: 654,
    pending: 87,
    verified: 456,
    admitted: 398,
    rejected: 111,
  },
  {
    program: 'Bachelor of Science in Computer Science',
    total: 523,
    pending: 65,
    verified: 389,
    admitted: 342,
    rejected: 69,
  },
  {
    program: 'Master of Business Administration',
    total: 287,
    pending: 32,
    verified: 198,
    admitted: 176,
    rejected: 57,
  },
  {
    program: 'Bachelor of Science in Microbiology',
    total: 198,
    pending: 24,
    verified: 143,
    admitted: 121,
    rejected: 31,
  },
  {
    program: 'Bachelor of Science in Mathematics',
    total: 176,
    pending: 19,
    verified: 134,
    admitted: 112,
    rejected: 23,
  },
  {
    program: 'Master of Science in Nursing',
    total: 143,
    pending: 16,
    verified: 98,
    admitted: 87,
    rejected: 18,
  },
];

const ACADEMIC_YEARS = ['2024-2025', '2025-2026', '2026-2027'];
const CLASS_TYPES = ['All', 'UnderGraduate', 'PostGraduate', 'Certificate', 'HD'];

export default function ApplicantCountsPage() {
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [selectedClassType, setSelectedClassType] = useState('All');
  const [showStats, setShowStats] = useState(false);

  const totalStats = PROGRAM_STATS.reduce(
    (acc, curr) => ({
      total: acc.total + curr.total,
      pending: acc.pending + curr.pending,
      verified: acc.verified + curr.verified,
      admitted: acc.admitted + curr.admitted,
      rejected: acc.rejected + curr.rejected,
    }),
    { total: 0, pending: 0, verified: 0, admitted: 0, rejected: 0 }
  );

  const handleShow = () => {
    setShowStats(true);
    toast.success('Statistics loaded successfully');
  };

  const handleExport = () => {
    toast.success('Exporting applicant counts report...');
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-black">
              APPLICANT COUNTS & STATISTICS
            </h1>
          </div>
          <p className="text-black">
            Comprehensive statistics and analytics of all applications
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-black mb-6 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Criteria
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Academic Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {ACADEMIC_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Class Type
              </label>
              <select
                value={selectedClassType}
                onChange={(e) => setSelectedClassType(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {CLASS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={handleShow}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Show Statistics
            </button>
            {showStats && (
              <button
                onClick={handleExport}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            )}
          </div>
        </div>

        {showStats && (
          <>
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <p className="text-sm font-medium text-black">Total Applications</p>
                <p className="text-3xl font-bold text-black mt-2">{totalStats.total}</p>
                <p className="text-sm text-blue-600 mt-1">100%</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                <p className="text-sm font-medium text-black">Pending</p>
                <p className="text-3xl font-bold text-black mt-2">{totalStats.pending}</p>
                <p className="text-sm text-yellow-600 mt-1">
                  {((totalStats.pending / totalStats.total) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <p className="text-sm font-medium text-black">Verified</p>
                <p className="text-3xl font-bold text-black mt-2">{totalStats.verified}</p>
                <p className="text-sm text-green-600 mt-1">
                  {((totalStats.verified / totalStats.total) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                <p className="text-sm font-medium text-black">Admitted</p>
                <p className="text-3xl font-bold text-black mt-2">{totalStats.admitted}</p>
                <p className="text-sm text-purple-600 mt-1">
                  {((totalStats.admitted / totalStats.total) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                <p className="text-sm font-medium text-black">Rejected</p>
                <p className="text-3xl font-bold text-black mt-2">{totalStats.rejected}</p>
                <p className="text-sm text-red-600 mt-1">
                  {((totalStats.rejected / totalStats.total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Program-wise Statistics */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-black flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  Program-wise Application Statistics
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                        Program
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-black">
                        Total
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-black">
                        Pending
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-black">
                        Verified
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-black">
                        Admitted
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-black">
                        Rejected
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-black">
                        Success Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {PROGRAM_STATS.map((stat, index) => (
                      <tr
                        key={index}
                        className={`border-b border-slate-100 hover:bg-blue-50 transition ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                        }`}
                      >
                        <td className="px-6 py-4 text-sm text-black font-medium">
                          {stat.program}
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-black font-bold">
                          {stat.total}
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                            {stat.pending}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            {stat.verified}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                            {stat.admitted}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            {stat.rejected}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center font-bold text-green-600">
                          {((stat.admitted / stat.total) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold">
                    <tr>
                      <td className="px-6 py-4 text-sm text-black">TOTAL</td>
                      <td className="px-6 py-4 text-sm text-center text-black">
                        {totalStats.total}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-black">
                        {totalStats.pending}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-black">
                        {totalStats.verified}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-black">
                        {totalStats.admitted}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-black">
                        {totalStats.rejected}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-green-600">
                        {((totalStats.admitted / totalStats.total) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}

        {!showStats && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BarChart3 className="w-16 h-16 text-black mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-black mb-2">
              No Statistics Loaded
            </h3>
            <p className="text-black">
              Select your filters and click "Show Statistics" to view applicant counts
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
