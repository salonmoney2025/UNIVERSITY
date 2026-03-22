'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { BadgeCheck } from 'lucide-react';

export default function StaffIDCardsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <BadgeCheck className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-black">Staff ID Cards</h1>
            <p className="text-sm text-black">Manage staff identification cards</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-black">Total Cards</h3>
            <p className="text-3xl font-bold text-black mt-2">156</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-black">Active</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">148</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-black">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">5</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-black">Expired</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">3</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Staff ID Card Management</h2>
          <p className="text-black">Generate and manage staff identification cards</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
