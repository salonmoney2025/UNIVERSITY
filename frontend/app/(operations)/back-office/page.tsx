'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Briefcase, Home, RefreshCw, Search, FileText } from 'lucide-react';
import Link from 'next/link';

export default function BackOfficePage() {
  const [activeTab, setActiveTab] = useState('applications');

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Briefcase className="w-8 h-8 text-teal-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">BACK OFFICE</h1>
                <p className="text-sm text-gray-300">Administrative management and operations</p>
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

        {/* Tabs */}
        <div className="px-6 py-4">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {['applications', 'records', 'reports', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-gray-600 text-sm font-medium">Pending Applications</h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">42</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-gray-600 text-sm font-medium">Processed Today</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">18</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-gray-600 text-sm font-medium">Total Records</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">1,234</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-gray-600 text-sm font-medium">Active Tasks</h3>
              <p className="text-3xl font-bold text-black mt-2">7</p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-black">
                {activeTab === 'applications' && 'Application Management'}
                {activeTab === 'records' && 'Record Management'}
                {activeTab === 'reports' && 'Reports & Analytics'}
                {activeTab === 'settings' && 'Back Office Settings'}
              </h2>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
                <Link
                  href="/back-office/reset-application"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset Application</span>
                </Link>
              </div>
            </div>

            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No {activeTab} data available</p>
              <p className="text-sm mt-2">Select an option from the menu to get started</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
