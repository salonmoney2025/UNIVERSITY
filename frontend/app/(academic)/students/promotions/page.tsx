'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { TrendingUp, Home, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function StudentPromotionsPage() {
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2025/2026');
  const [selectedLevel, setSelectedLevel] = useState('');

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-teal-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">STUDENT PROMOTIONS</h1>
                <p className="text-sm text-gray-300">Promote students to next level</p>
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

        {/* Promotion Form */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-black mb-6">Student Promotion Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Academic Year */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Current Academic Year <span className="text-red-600">*</span>
                </label>
                <select
                  value={selectedAcademicYear}
                  onChange={(e) => setSelectedAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 text-black"
                >
                  <option>2024/2025</option>
                  <option>2025/2026</option>
                  <option>2026/2027</option>
                </select>
              </div>

              {/* From Level */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  From Level <span className="text-red-600">*</span>
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 text-black"
                >
                  <option value="">--Select Level--</option>
                  <option>100 Level</option>
                  <option>200 Level</option>
                  <option>300 Level</option>
                  <option>400 Level</option>
                </select>
              </div>

              {/* To Level */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  To Level <span className="text-red-600">*</span>
                </label>
                <select
                  disabled={!selectedLevel}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 text-black bg-gray-50"
                >
                  <option value="">--Auto Selected--</option>
                  {selectedLevel === '100 Level' && <option>200 Level</option>}
                  {selectedLevel === '200 Level' && <option>300 Level</option>}
                  {selectedLevel === '300 Level' && <option>400 Level</option>}
                  {selectedLevel === '400 Level' && <option>Graduate</option>}
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Department (Optional)
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 text-black">
                  <option value="">All Departments</option>
                  <option>Computer Science</option>
                  <option>Electrical Engineering</option>
                  <option>Mathematics</option>
                  <option>Physics</option>
                </select>
              </div>
            </div>

            {/* Students List */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-black mb-4">
                Students Eligible for Promotion
              </h3>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 text-center">
                <p className="text-gray-600">
                  Select a level to view eligible students
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded flex items-center space-x-2 transition-colors">
                <CheckCircle className="w-5 h-5" />
                <span>Promote Selected Students</span>
              </button>
              <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors">
                Promote All Eligible
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Important Information</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Students will be promoted to the next academic level</li>
              <li>• Only students who meet academic requirements will be promoted</li>
              <li>• This action cannot be undone. Please review carefully</li>
              <li>• Students on academic probation will not be auto-promoted</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
