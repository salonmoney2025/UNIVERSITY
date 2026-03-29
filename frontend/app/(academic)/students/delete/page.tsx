'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Trash2, Home, Search, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface StudentInfo {
  id: string;
  name: string;
  email: string;
  level: string;
  department: string;
  enrollmentDate: string;
  program?: string;
  year?: string;
}

export default function DeleteStudentsPage() {
  const [studentId, setStudentId] = useState('');
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSearch = () => {
    if (studentId) {
      setStudentInfo({
        id: studentId,
        name: 'John Doe',
        email: 'john.doe@ebkust.edu.sl',
        level: '200 Level',
        department: 'Computer Science',
        enrollmentDate: '2024-09-01',
      });
      setShowConfirmation(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-solid black-50">
        {/* Header */}
        <div className="bg-red-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trash2 className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">DELETE STUDENT INFORMATION</h1>
                <p className="text-sm text-red-100">Permanently remove student records</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded flex items-center space-x-2 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="px-6 py-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-red-800 font-semibold">Warning: Irreversible Action</h3>
                <p className="text-red-700 text-sm mt-1">
                  Deleting student information is permanent and cannot be undone.
                  All academic records, grades, and associated data will be permanently removed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Student */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-lg shadow border border-solid black-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-black mb-4">Find Student to Delete</h2>
            <div className="flex space-x-3">
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter Student ID or Email"
                className="flex-1 px-4 py-2 border border-solid black-300 rounded focus:ring-2 focus:ring-red-500 text-black"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-solid black-600 hover:bg-solid black-700 text-white rounded flex items-center space-x-2 transition-colors"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Student Information & Delete Confirmation */}
          {studentInfo && (
            <>
              <div className="bg-white rounded-lg shadow border border-solid black-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-black mb-4">Student Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-black">Student ID</p>
                    <p className="text-black font-medium">{studentInfo.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-black">Full Name</p>
                    <p className="text-black font-medium">{studentInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-black">Email</p>
                    <p className="text-black font-medium">{studentInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-black">Level</p>
                    <p className="text-black font-medium">{studentInfo.level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-black">Department</p>
                    <p className="text-black font-medium">{studentInfo.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-black">Enrollment Date</p>
                    <p className="text-black font-medium">{studentInfo.enrollmentDate}</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowConfirmation(true)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded flex items-center space-x-2 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Student</span>
                </button>
              </div>

              {/* Confirmation Dialog */}
              {showConfirmation && (
                <div className="bg-white rounded-lg shadow-lg border-2 border-red-500 p-6">
                  <div className="flex items-start mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-black">Confirm Deletion</h3>
                      <p className="text-black mt-2">
                        You are about to permanently delete <strong>{studentInfo.name}</strong> ({studentInfo.id}).
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black mb-2">
                      Type <span className="font-mono bg-solid black-100 px-2 py-1">DELETE</span> to confirm:
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="w-full px-4 py-2 border border-solid black-300 rounded focus:ring-2 focus:ring-red-500 text-black"
                      placeholder="Type DELETE to confirm"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      disabled={confirmText !== 'DELETE'}
                      className={`px-6 py-3 font-medium rounded flex items-center space-x-2 transition-colors ${
                        confirmText === 'DELETE'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-solid black-300 text-black cursor-not-allowed'
                      }`}
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>Confirm Deletion</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowConfirmation(false);
                        setConfirmText('');
                      }}
                      className="px-6 py-3 bg-solid black-600 hover:bg-solid black-700 text-white font-medium rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
