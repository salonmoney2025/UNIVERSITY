'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { UserX, Home, Search, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ResetOtherStudentsPage() {
  const [searchType, setSearchType] = useState('part-time');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserX className="w-8 h-8 text-teal-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">RESET OTHER STUDENTS</h1>
                <p className="text-sm text-gray-300">Reset part-time, distance learning students</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded flex items-center space-x-2 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </div>
        </div>

        {/* Search Section */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-black mb-4">Find Student</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Student Type
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 text-black"
                >
                  <option value="part-time">Part-Time Students</option>
                  <option value="distance">Distance Learning Students</option>
                  <option value="special">Special Program Students</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Search Student
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter Student ID or Name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 text-black"
                  />
                  <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded flex items-center space-x-2 transition-colors">
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reset Options */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-black mb-4">Reset Options</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                <div>
                  <h3 className="font-medium text-black">Reset Password</h3>
                  <p className="text-sm text-gray-600">Reset student account password</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                  Reset Password
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                <div>
                  <h3 className="font-medium text-black">Reset Enrollment</h3>
                  <p className="text-sm text-gray-600">Reset course enrollment status</p>
                </div>
                <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors">
                  Reset Enrollment
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                <div>
                  <h3 className="font-medium text-black">Reset Account Status</h3>
                  <p className="text-sm text-gray-600">Reactivate suspended accounts</p>
                </div>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors">
                  Reset Status
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-red-300 rounded-lg bg-red-50">
                <div>
                  <h3 className="font-medium text-red-900">Clear All Data</h3>
                  <p className="text-sm text-red-700">Remove all student data (irreversible)</p>
                </div>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Clear Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
