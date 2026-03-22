'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { FileText } from 'lucide-react';

export default function ExaminationsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-black">Examinations</h1>
            <p className="text-sm text-black">Manage exams and results</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-black">Total Exams</h3>
            <p className="text-3xl font-bold text-black mt-2">24</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-black">Scheduled</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">8</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-black">Completed</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">16</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-black">Pending Results</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">5</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Examination Management</h2>
          <p className="text-black">Manage examinations, schedules and results</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
