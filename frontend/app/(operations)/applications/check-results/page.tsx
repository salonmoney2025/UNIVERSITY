'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FileCheck, Download, Eye, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface ApplicationResult {
  id: string;
  appId: string;
  name: string;
  program: string;
  score: number;
  status: 'Admitted' | 'Rejected' | 'Waitlisted';
  remarks: string;
}

const RESULTS: ApplicationResult[] = [
  {
    id: '1',
    appId: 'APP2025001',
    name: 'FATIMA BANGURA',
    program: 'BSc Nursing',
    score: 85,
    status: 'Admitted',
    remarks: 'Excellent performance',
  },
  {
    id: '2',
    appId: 'APP2025002',
    name: 'IBRAHIM MANSARAY',
    program: 'MBA',
    score: 78,
    status: 'Admitted',
    remarks: 'Good candidate',
  },
  {
    id: '3',
    appId: 'APP2025003',
    name: 'MARIAMA KAMARA',
    program: 'BSc Computer Science',
    score: 92,
    status: 'Admitted',
    remarks: 'Outstanding candidate',
  },
  {
    id: '4',
    appId: 'APP2025004',
    name: 'ABDUL SESAY',
    program: 'BSc Microbiology',
    score: 68,
    status: 'Waitlisted',
    remarks: 'Borderline scores',
  },
  {
    id: '5',
    appId: 'APP2025005',
    name: 'ZAINAB KOROMA',
    program: 'BSc Mathematics',
    score: 45,
    status: 'Rejected',
    remarks: 'Did not meet minimum requirements',
  },
];

export default function CheckResultsPage() {
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  const filteredResults = RESULTS.filter((result) => {
    const matchesProgram = selectedProgram === 'all' || result.program === selectedProgram;
    const matchesStatus = selectedStatus === 'all' || result.status === selectedStatus;
    const matchesSearch =
      result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.appId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProgram && matchesStatus && matchesSearch;
  });

  const handleShow = () => {
    setShowResults(true);
    toast.success(`Found ${filteredResults.length} result(s)`);
  };

  const handleExportResults = () => {
    toast.success('Exporting results...');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Admitted: 'bg-green-100 text-green-700 border-green-300',
      Rejected: 'bg-red-100 text-red-700 border-red-300',
      Waitlisted: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    };
    return styles[status as keyof typeof styles];
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 font-bold';
    if (score >= 60) return 'text-blue-600 font-bold';
    return 'text-red-600 font-bold';
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileCheck className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-black">CHECK APPLICATION RESULTS</h1>
          </div>
          <p className="text-black">View and manage application results and admission status</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-black">Admitted</p>
            <p className="text-3xl font-bold text-black mt-1">
              {RESULTS.filter((r) => r.status === 'Admitted').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-black">Waitlisted</p>
            <p className="text-3xl font-bold text-black mt-1">
              {RESULTS.filter((r) => r.status === 'Waitlisted').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <p className="text-sm font-medium text-black">Rejected</p>
            <p className="text-3xl font-bold text-black mt-1">
              {RESULTS.filter((r) => r.status === 'Rejected').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-black mb-6 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Criteria
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Program</label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="all">All Programs</option>
                <option value="BSc Nursing">BSc Nursing</option>
                <option value="MBA">MBA</option>
                <option value="BSc Computer Science">BSc Computer Science</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="Admitted">Admitted</option>
                <option value="Waitlisted">Waitlisted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={handleShow}
              className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              Show Results
            </button>
            {showResults && filteredResults.length > 0 && (
              <button
                onClick={handleExportResults}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Results
              </button>
            )}
          </div>
        </div>

        {/* Results Table */}
        {showResults && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                      App ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                      Program
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-black">
                      Score
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-black">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                      Remarks
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-black">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, index) => (
                    <tr
                      key={result.id}
                      className={`border-b border-slate-100 hover:bg-purple-50 transition ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-black font-medium">
                        {result.appId}
                      </td>
                      <td className="px-6 py-4 text-sm text-black">{result.name}</td>
                      <td className="px-6 py-4 text-sm text-black">{result.program}</td>
                      <td className={`px-6 py-4 text-sm text-center ${getScoreColor(result.score)}`}>
                        {result.score}%
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                            result.status
                          )}`}
                        >
                          {result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-black">{result.remarks}</td>
                      <td className="px-6 py-4 text-center">
                        <button className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm font-medium">
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
        )}

        {!showResults && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileCheck className="w-16 h-16 text-black mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-black mb-2">No Results Loaded</h3>
            <p className="text-black">Select your filters and click "Show Results"</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
