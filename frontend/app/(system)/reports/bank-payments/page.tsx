'use client';

import { Building2 } from 'lucide-react';

export default function BankPaymentsReportPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bank Payments Report</h1>
            <p className="text-gray-600">Track payments received through various bank channels</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <p className="text-gray-600 text-center">
            Bank payments report with transaction details will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
}
