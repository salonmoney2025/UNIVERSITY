'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Allotment {
  id: string;
  appId: string;
  studentName: string;
  program: string;
  allottedCourse: string;
  allotmentDate: string;
  semester: string;
}

const ALLOTMENTS: Allotment[] = [
  {
    id: '1',
    appId: 'APP2025001',
    studentName: 'FATIMA BANGURA',
    program: 'BSc Nursing',
    allottedCourse: 'Anatomy 101',
    allotmentDate: '2025-01-15',
    semester: 'Semester 1',
  },
  {
    id: '2',
    appId: 'APP2025002',
    studentName: 'IBRAHIM MANSARAY',
    program: 'MBA',
    allottedCourse: 'Business Strategy',
    allotmentDate: '2025-01-16',
    semester: 'Semester 1',
  },
  {
    id: '3',
    appId: 'APP2025003',
    studentName: 'MARIAMA KAMARA',
    program: 'BSc Computer Science',
    allottedCourse: 'Programming Fundamentals',
    allotmentDate: '2025-01-17',
    semester: 'Semester 1',
  },
];

export default function DeleteAllotmentPage() {
  const [allotments, setAllotments] = useState(ALLOTMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAllotments, setSelectedAllotments] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filteredAllotments = allotments.filter(
    (allotment) =>
      allotment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allotment.appId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allotment.allottedCourse.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (id: string) => {
    setSelectedAllotments((prev) =>
      prev.includes(id) ? prev.filter((aid) => aid !== id) : [...prev, id]
    );
  };

  const handleDeleteSingle = (id: string) => {
    setDeleteTarget(id);
    setShowConfirmDialog(true);
  };

  const handleBulkDelete = () => {
    if (selectedAllotments.length === 0) {
      toast.error('No allotments selected');
      return;
    }
    setDeleteTarget('bulk');
    setShowConfirmDialog(true);
  };

  const confirmDelete = () => {
    if (deleteTarget === 'bulk') {
      setAllotments((prev) => prev.filter((a) => !selectedAllotments.includes(a.id)));
      toast.success(`Deleted ${selectedAllotments.length} allotment(s)`);
      setSelectedAllotments([]);
    } else if (deleteTarget) {
      const allotment = allotments.find((a) => a.id === deleteTarget);
      setAllotments((prev) => prev.filter((a) => a.id !== deleteTarget));
      toast.success(`Deleted allotment for ${allotment?.studentName}`);
    }
    setShowConfirmDialog(false);
    setDeleteTarget(null);
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setDeleteTarget(null);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trash2 className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-black">DELETE ALLOTMENT</h1>
          </div>
          <p className="text-black">Remove or modify course allotments for applicants</p>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">Critical Action</p>
            <p className="text-sm text-red-800 mt-1">
              Deleting course allotments will remove student-course assignments. This action cannot
              be undone. Proceed with caution.
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-sm font-medium text-black">Total Allotments</p>
          <p className="text-4xl font-bold text-black mt-1">{allotments.length}</p>
        </div>

        {/* Search and Bulk Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <input
              type="text"
              placeholder="Search by name, ID, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />

            {selectedAllotments.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedAllotments.length})
              </button>
            )}
          </div>
        </div>

        {/* Allotments List */}
        <div className="space-y-4">
          {filteredAllotments.map((allotment) => (
            <div
              key={allotment.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedAllotments.includes(allotment.id)}
                  onChange={() => handleSelect(allotment.id)}
                  className="w-5 h-5 text-red-600 border-solid black-300 rounded focus:ring-red-500"
                />

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-black mb-2">
                    {allotment.studentName}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <p className="text-sm text-black">
                      <span className="font-medium">App ID:</span> {allotment.appId}
                    </p>
                    <p className="text-sm text-black">
                      <span className="font-medium">Program:</span> {allotment.program}
                    </p>
                    <p className="text-sm text-black">
                      <span className="font-medium">Semester:</span> {allotment.semester}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Allotted Course</p>
                    <p className="text-sm text-blue-800 font-medium">{allotment.allottedCourse}</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Allotted on: {allotment.allotmentDate}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSingle(allotment.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filteredAllotments.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Trash2 className="w-16 h-16 text-black mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">No Allotments Found</h3>
              <p className="text-black">No allotments match your search criteria</p>
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">Confirm Deletion</h3>
                  <p className="text-sm text-black">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-sm text-black mb-6">
                {deleteTarget === 'bulk'
                  ? `Are you sure you want to delete ${selectedAllotments.length} allotment(s)?`
                  : 'Are you sure you want to delete this allotment?'}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
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
