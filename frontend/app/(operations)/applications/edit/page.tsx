'use client';

import { FilePenLine } from 'lucide-react';

export default function EditApplicationPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FilePenLine className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Application Information</h1>
            <p className="text-gray-600">Modify student application details</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <p className="text-gray-600 text-center">
            Application editing form will be integrated here. Select an application to edit.
          </p>
        </div>
      </div>
    </div>
  );
}
