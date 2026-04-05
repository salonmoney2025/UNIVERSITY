'use client';

import { History } from 'lucide-react';

export default function FeesHistoryReportPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <History className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fees History Report</h1>
            <p className="text-gray-600">Historical fee payment records and trends</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <p className="text-gray-600 text-center">
            Fees history report with historical data and trends will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
}
