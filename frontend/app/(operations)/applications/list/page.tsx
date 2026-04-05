'use client';

import { ClipboardList } from 'lucide-react';

export default function ApplicationListPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <ClipboardList className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Online Application List</h1>
            <p className="text-gray-600">Complete list of all online applications</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <p className="text-gray-600 text-center">
            Application list will be displayed here with filtering and sorting options.
          </p>
        </div>
      </div>
    </div>
  );
}
