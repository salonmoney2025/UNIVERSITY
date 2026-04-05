'use client';

import { CheckCircle, Search, Filter } from 'lucide-react';

export default function VerifiedApplicationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Verified Applications</h1>
            <p className="text-gray-600">View and manage verified student applications</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Verified Applications
          </h3>
          <p className="text-gray-600 mb-6">
            This page displays all verified student applications. Integration with backend API coming soon.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Search className="w-4 h-4" />
              Search Applications
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
