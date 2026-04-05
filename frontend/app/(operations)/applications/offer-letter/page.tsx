'use client';

import { HandshakeIcon } from 'lucide-react';

export default function AcceptOfferLetterPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <HandshakeIcon className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Accept Offer Letter</h1>
            <p className="text-gray-600">Process and manage offer letter acceptances</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <p className="text-gray-600 text-center">
            Offer letter acceptance management interface will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
}
