'use client';

import { GraduationCap } from 'lucide-react';

export default function MatriculationLetterPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <GraduationCap className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Matriculation Letter</h1>
            <p className="text-gray-600">Generate and manage matriculation letters for students</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <p className="text-gray-600 text-center">
            Matriculation letter generation interface will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
}
