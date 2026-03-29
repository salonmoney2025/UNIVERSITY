'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FileSignature, Send, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProvisionalStudent {
  id: string;
  appId: string;
  name: string;
  course: string;
  email: string;
  phone: string;
  pendingDocuments: string[];
  status: 'Pending' | 'Verified' | 'Expired';
}

const PROVISIONAL_STUDENTS: ProvisionalStudent[] = [
  {
    id: '1',
    appId: 'PROV2024001',
    name: 'FATIMA BANGURA',
    course: 'Bachelor of Science in Nursing',
    email: 'fatima.bangura@email.com',
    phone: '+232 77 123456',
    pendingDocuments: ['Birth Certificate', 'WASSCE Results'],
    status: 'Pending',
  },
  {
    id: '2',
    appId: 'PROV2024002',
    name: 'IBRAHIM MANSARAY',
    course: 'Master of Business Administration',
    email: 'ibrahim.m@email.com',
    phone: '+232 76 234567',
    pendingDocuments: ['Degree Certificate', 'Transcript'],
    status: 'Pending',
  },
  {
    id: '3',
    appId: 'PROV2024003',
    name: 'ZAINAB CONTEH',
    course: 'Bachelor of Science in Computer Science',
    email: 'zainab.c@email.com',
    phone: '+232 78 345678',
    pendingDocuments: ['Medical Certificate'],
    status: 'Verified',
  },
];

export default function ProvisionalLetterPage() {
  const [students] = useState(PROVISIONAL_STUDENTS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.appId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleIssueProvisionalLetter = (appId: string, name: string) => {
    toast.success(`Provisional letter issued to ${name}`);
    // Implement actual issue functionality
  };

  const handleVerifyDocuments = (appId: string, name: string) => {
    toast.success(`Documents verified for ${name}`);
    // Implement verification functionality
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      Verified: 'bg-green-100 text-green-700 border-green-300',
      Expired: 'bg-red-100 text-red-700 border-red-300',
    };
    return styles[status as keyof typeof styles] || styles.Pending;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-black mb-4">
            <span className="text-black">Provisional Letters</span>
            <span className="text-black">/</span>
            <a href="/letters" className="text-blue-600 hover:text-blue-700">
              Letters
            </a>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <FileSignature className="w-8 h-8 text-yellow-600" />
            <h1 className="text-3xl font-bold text-black">
              PROVISIONAL ADMISSION LETTERS
            </h1>
          </div>
          <p className="text-black">
            Issue provisional letters to applicants pending document verification
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-black">Pending Verification</p>
                <p className="text-3xl font-bold text-black mt-1">
                  {students.filter((s) => s.status === 'Pending').length}
                </p>
              </div>
              <FileSignature className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-black">Verified</p>
                <p className="text-3xl font-bold text-black mt-1">
                  {students.filter((s) => s.status === 'Verified').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-black">Expired</p>
                <p className="text-3xl font-bold text-black mt-1">
                  {students.filter((s) => s.status === 'Expired').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <input
            type="text"
            placeholder="Search by name or application ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none transition"
          />
        </div>

        {/* Students List */}
        <div className="space-y-4">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-black">
                      {student.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                        student.status
                      )}`}
                    >
                      {student.status}
                    </span>
                  </div>
                  <p className="text-sm text-black mb-1">
                    <span className="font-medium">App ID:</span> {student.appId}
                  </p>
                  <p className="text-sm text-black mb-1">
                    <span className="font-medium">Course:</span> {student.course}
                  </p>
                  <p className="text-sm text-black mb-1">
                    <span className="font-medium">Email:</span> {student.email}
                  </p>
                  <p className="text-sm text-black mb-3">
                    <span className="font-medium">Phone:</span> {student.phone}
                  </p>

                  {/* Pending Documents */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                    <p className="text-sm font-semibold text-yellow-900 mb-2">
                      Pending Documents:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {student.pendingDocuments.map((doc, idx) => (
                        <li key={idx} className="text-sm text-yellow-800">
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:w-48">
                  <button
                    onClick={() =>
                      handleIssueProvisionalLetter(student.appId, student.name)
                    }
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Issue Letter
                  </button>
                  <button
                    onClick={() =>
                      handleVerifyDocuments(student.appId, student.name)
                    }
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Verify Docs
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredStudents.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FileSignature className="w-16 h-16 text-black mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">
                No Students Found
              </h3>
              <p className="text-black">
                No students match your search criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
