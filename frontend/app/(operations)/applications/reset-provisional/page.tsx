'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProvisionalLetter {
  id: string;
  appId: string;
  name: string;
  program: string;
  issueDate: string;
  status: 'Active' | 'Expired' | 'Revoked';
}

const PROVISIONAL_LETTERS: ProvisionalLetter[] = [
  {
    id: '1',
    appId: 'APP2025001',
    name: 'FATIMA BANGURA',
    program: 'BSc Nursing',
    issueDate: '2025-01-10',
    status: 'Active',
  },
  {
    id: '2',
    appId: 'APP2025002',
    name: 'IBRAHIM MANSARAY',
    program: 'MBA',
    issueDate: '2024-12-15',
    status: 'Expired',
  },
  {
    id: '3',
    appId: 'APP2025003',
    name: 'MARIAMA KAMARA',
    program: 'BSc Computer Science',
    issueDate: '2025-01-05',
    status: 'Revoked',
  },
];

export default function ResetProvisionalLettersPage() {
  const [letters] = useState(PROVISIONAL_LETTERS);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);

  const filteredLetters = letters.filter(
    (letter) => filterStatus === 'all' || letter.status === filterStatus
  );

  const handleSelect = (id: string) => {
    setSelectedLetters((prev) =>
      prev.includes(id) ? prev.filter((lid) => lid !== id) : [...prev, id]
    );
  };

  const handleReset = (appId: string, name: string) => {
    toast.success(`Provisional letter reset for ${name}`);
  };

  const handleBulkReset = () => {
    if (selectedLetters.length === 0) {
      toast.error('No letters selected');
      return;
    }
    toast.success(`Resetting ${selectedLetters.length} provisional letter(s)`);
    setSelectedLetters([]);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Active: 'bg-green-100 text-green-700 border-green-300',
      Expired: 'bg-red-100 text-red-700 border-red-300',
      Revoked: 'bg-solid black-100 text-black border-solid black-300',
    };
    return styles[status as keyof typeof styles];
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <RefreshCw className="w-8 h-8 text-pink-600" />
            <h1 className="text-3xl font-bold text-black">RESET PROVISIONAL LETTERS</h1>
          </div>
          <p className="text-black">Reset and regenerate provisional admission letters</p>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-900">Important Notice</p>
            <p className="text-sm text-yellow-800 mt-1">
              Resetting a provisional letter will invalidate the current letter and generate a new
              one. This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-black">Active</p>
            <p className="text-3xl font-bold text-black mt-1">
              {letters.filter((l) => l.status === 'Active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <p className="text-sm font-medium text-black">Expired</p>
            <p className="text-3xl font-bold text-black mt-1">
              {letters.filter((l) => l.status === 'Expired').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-solid black-500">
            <p className="text-sm font-medium text-black">Revoked</p>
            <p className="text-3xl font-bold text-black mt-1">
              {letters.filter((l) => l.status === 'Revoked').length}
            </p>
          </div>
        </div>

        {/* Filter and Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Revoked">Revoked</option>
            </select>

            {selectedLetters.length > 0 && (
              <button
                onClick={handleBulkReset}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Selected ({selectedLetters.length})
              </button>
            )}
          </div>
        </div>

        {/* Letters List */}
        <div className="space-y-4">
          {filteredLetters.map((letter) => (
            <div
              key={letter.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedLetters.includes(letter.id)}
                  onChange={() => handleSelect(letter.id)}
                  className="w-5 h-5 text-pink-600 border-solid black-300 rounded focus:ring-pink-500"
                />

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-black">{letter.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                        letter.status
                      )}`}
                    >
                      {letter.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <p className="text-sm text-black">
                      <span className="font-medium">App ID:</span> {letter.appId}
                    </p>
                    <p className="text-sm text-black">
                      <span className="font-medium">Program:</span> {letter.program}
                    </p>
                    <p className="text-sm text-black">
                      <span className="font-medium">Issue Date:</span> {letter.issueDate}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleReset(letter.appId, letter.name)}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
