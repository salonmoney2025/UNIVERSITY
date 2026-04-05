'use client';

import { FileSignature } from 'lucide-react';

export default function SetProvisionalLetterPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FileSignature className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Set Provisional Letter</h1>
            <p className="text-gray-600">Configure and assign provisional admission letters</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <p className="text-gray-600 text-center">
            Provisional letter configuration interface will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
}
