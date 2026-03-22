'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Edit, Save, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface Applicant {
  id: string;
  appId: string;
  name: string;
  currentProgram: string;
  email: string;
}

const APPLICANTS: Applicant[] = [
  {
    id: '1',
    appId: 'APP2025001',
    name: 'FATIMA BANGURA',
    currentProgram: 'BSc Nursing',
    email: 'fatima@email.com',
  },
  {
    id: '2',
    appId: 'APP2025002',
    name: 'IBRAHIM MANSARAY',
    currentProgram: 'MBA',
    email: 'ibrahim@email.com',
  },
];

const PROGRAMS = [
  'BSc Nursing',
  'BSc Computer Science',
  'BSc Microbiology',
  'BSc Mathematics',
  'BSc Physics',
  'MBA',
  'MSc Nursing',
];

export default function UpdateCourseInfoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [newProgram, setNewProgram] = useState('');
  const [reason, setReason] = useState('');

  const filteredApplicants = APPLICANTS.filter(
    (app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.appId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (appId: string) => {
    const applicant = APPLICANTS.find((a) => a.appId === appId);
    if (applicant) {
      setSelectedApplicant(applicant);
      setNewProgram(applicant.currentProgram);
      toast.success(`Applicant ${applicant.name} loaded`);
    } else {
      toast.error('Applicant not found');
    }
  };

  const handleUpdate = () => {
    if (!selectedApplicant || !newProgram || !reason) {
      toast.error('Please fill all fields');
      return;
    }
    toast.success(`Course updated for ${selectedApplicant.name}`);
    setSelectedApplicant(null);
    setSearchTerm('');
    setNewProgram('');
    setReason('');
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Edit className="w-8 h-8 text-cyan-600" />
            <h1 className="text-3xl font-bold text-black">UPDATE COURSE INFORMATION</h1>
          </div>
          <p className="text-black">Update course selections and program information</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-black mb-4">Search Applicant</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter Application ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
            />
            <button
              onClick={() => searchTerm && handleSearch(searchTerm.toUpperCase())}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>

          {/* Quick Select */}
          {filteredApplicants.length > 0 && searchTerm && (
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-sm font-medium text-black mb-2">Suggestions:</p>
              <div className="space-y-2">
                {filteredApplicants.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleSearch(app.appId)}
                    className="w-full text-left px-4 py-2 bg-white border border-slate-200 rounded hover:bg-cyan-50 transition"
                  >
                    <p className="text-sm font-medium text-black">{app.name}</p>
                    <p className="text-xs text-black">
                      {app.appId} - {app.currentProgram}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Update Form */}
        {selectedApplicant && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-black mb-6">Update Course Details</h2>

            {/* Current Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Current Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Name:</span> {selectedApplicant.name}
                </p>
                <p className="text-sm text-blue-800">
                  <span className="font-medium">App ID:</span> {selectedApplicant.appId}
                </p>
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Current Program:</span>{' '}
                  {selectedApplicant.currentProgram}
                </p>
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Email:</span> {selectedApplicant.email}
                </p>
              </div>
            </div>

            {/* Update Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  New Program
                </label>
                <select
                  value={newProgram}
                  onChange={(e) => setNewProgram(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                >
                  <option value="">Select Program</option>
                  {PROGRAMS.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Reason for Change
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Explain the reason for course change..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleUpdate}
                  className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Update Course
                </button>
                <button
                  onClick={() => {
                    setSelectedApplicant(null);
                    setSearchTerm('');
                  }}
                  className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
