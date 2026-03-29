'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { UserPlus, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AddOtherStudentsPage() {
  const [studentType, setStudentType] = useState('');

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-solid black-50">
        {/* Header */}
        <div className="bg-solid black-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserPlus className="w-8 h-8 text-teal-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">ADD OTHER STUDENTS</h1>
                <p className="text-sm text-black">Add part-time, distance learning, and special students</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-solid black-600 hover:bg-solid black-500 text-white rounded flex items-center space-x-2 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </div>
        </div>

        {/* Student Type Selection */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-lg shadow border border-solid black-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-black mb-4">Select Student Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setStudentType('part-time')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  studentType === 'part-time'
                    ? 'border-teal-600 bg-teal-50'
                    : 'border-solid black-300 hover:border-teal-400'
                }`}
              >
                <h3 className="font-semibold text-black mb-2">Part-Time Student</h3>
                <p className="text-sm text-black">Evening or weekend students</p>
              </button>

              <button
                onClick={() => setStudentType('distance')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  studentType === 'distance'
                    ? 'border-teal-600 bg-teal-50'
                    : 'border-solid black-300 hover:border-teal-400'
                }`}
              >
                <h3 className="font-semibold text-black mb-2">Distance Learning</h3>
                <p className="text-sm text-black">Remote or online students</p>
              </button>

              <button
                onClick={() => setStudentType('special')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  studentType === 'special'
                    ? 'border-teal-600 bg-teal-50'
                    : 'border-solid black-300 hover:border-teal-400'
                }`}
              >
                <h3 className="font-semibold text-black mb-2">Special Program</h3>
                <p className="text-sm text-black">Certificate or diploma students</p>
              </button>
            </div>
          </div>

          {/* Registration Form */}
          {studentType && (
            <div className="bg-white rounded-lg shadow border border-solid black-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-black">
                  {studentType === 'part-time' && 'Part-Time Student Registration'}
                  {studentType === 'distance' && 'Distance Learning Student Registration'}
                  {studentType === 'special' && 'Special Program Student Registration'}
                </h2>
                <button className="px-4 py-2 bg-solid black-500 hover:bg-solid black-600 text-white rounded flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Clear Form</span>
                </button>
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Student ID <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-solid black-300 rounded focus:ring-2 focus:ring-teal-500 text-black"
                    placeholder="Enter Student ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Program <span className="text-red-600">*</span>
                  </label>
                  <select className="w-full px-3 py-2 border border-solid black-300 rounded focus:ring-2 focus:ring-teal-500 text-black">
                    <option value="">--Select Program--</option>
                    <option>Certificate Program</option>
                    <option>Diploma Program</option>
                    <option>Professional Development</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    First Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-solid black-300 rounded focus:ring-2 focus:ring-teal-500 text-black"
                    placeholder="Enter First Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Last Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-solid black-300 rounded focus:ring-2 focus:ring-teal-500 text-black"
                    placeholder="Enter Last Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-solid black-300 rounded focus:ring-2 focus:ring-teal-500 text-black"
                    placeholder="Enter Email Address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Mobile Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-solid black-300 rounded focus:ring-2 focus:ring-teal-500 text-black"
                    placeholder="Enter Mobile Number"
                  />
                </div>

                {/* Submit Button */}
                <div className="md:col-span-2 flex space-x-3">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded flex items-center space-x-2 transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Register Student</span>
                  </button>
                  <Link
                    href="/students"
                    className="px-6 py-3 bg-solid black-600 hover:bg-solid black-700 text-white font-medium rounded transition-colors"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
