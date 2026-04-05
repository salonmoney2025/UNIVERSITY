'use client';

import { FileText } from 'lucide-react';

export default function CharacterReferencePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Character Reference</h1>
            <p className="text-gray-600">Generate character reference letters for students</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <p className="text-gray-600 text-center">
            Character reference letter generation interface will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
}
