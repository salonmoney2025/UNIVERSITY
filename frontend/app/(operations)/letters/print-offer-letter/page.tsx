'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ExportMenu from '@/components/export/ExportMenu';
import {
  Home, RefreshCw, LayoutDashboard, Search, Printer, Eye, FileText,
  Download, Mail, CheckCircle, Calendar, User, GraduationCap
} from 'lucide-react';

interface Applicant {
  id: string;
  applicationId: string;
  fullName: string;
  program: string;
  faculty: string;
  campus: string;
  email: string;
  phone: string;
  admissionYear: string;
  offerStatus: 'pending' | 'generated' | 'sent';
  dateApplied: string;
}

export default function PrintOfferLetterPage() {
  const router = useRouter();
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [applicants, setApplicants] = useState<Applicant[]>([
    {
      id: '1',
      applicationId: 'APP-2025-001',
      fullName: 'John Kamara',
      program: 'Computer Science',
      faculty: 'Engineering',
      campus: 'Main Campus',
      email: 'john.kamara@example.com',
      phone: '+232 76 123 456',
      admissionYear: '2025/2026',
      offerStatus: 'pending',
      dateApplied: '2025-01-15'
    },
    {
      id: '2',
      applicationId: 'APP-2025-002',
      fullName: 'Fatmata Sesay',
      program: 'Business Administration',
      faculty: 'Business',
      campus: 'Bo Campus',
      email: 'fatmata.sesay@example.com',
      phone: '+232 77 234 567',
      admissionYear: '2025/2026',
      offerStatus: 'generated',
      dateApplied: '2025-01-18'
    },
    {
      id: '3',
      applicationId: 'APP-2025-003',
      fullName: 'Mohamed Bangura',
      program: 'Civil Engineering',
      faculty: 'Engineering',
      campus: 'Main Campus',
      email: 'mohamed.bangura@example.com',
      phone: '+232 78 345 678',
      admissionYear: '2025/2026',
      offerStatus: 'sent',
      dateApplied: '2025-01-20'
    }
  ]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleRefresh = () => {
    // Implement refresh logic - fetch fresh data from API
    console.log('Refreshing data...');
  };

  const handlePrintOfferLetter = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setShowPreview(true);
  };

  const handleGenerateAll = () => {
    alert('Generating offer letters for all eligible applicants...');
  };

  const handlePrint = () => {
    if (selectedApplicant) {
      window.print();
    }
  };

  const handleSendEmail = (applicant: Applicant) => {
    alert(`Sending offer letter to ${applicant.email}`);
  };

  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = applicant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         applicant.applicationId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCampus = selectedCampus === 'all' || applicant.campus === selectedCampus;
    const matchesProgram = selectedProgram === 'all' || applicant.program === selectedProgram;
    return matchesSearch && matchesCampus && matchesProgram;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Action Buttons Bar */}
        <div className="bg-white border-b border-gray-300 px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
            >
              <Home className="h-4 w-4" />
              HOME
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              DASHBOARD
            </button>
            <button
              onClick={handleGenerateAll}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
            >
              <FileText className="h-4 w-4" />
              GENERATE ALL
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded font-medium transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              REFRESH
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-portal-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Print Offer Letters</h1>
              <p className="mt-2 text-base text-gray-600">
                Generate and print admission offer letters for accepted applicants
              </p>
            </div>
            <div className="flex gap-3">
              <ExportMenu data={applicants} filename="offer-letters" />
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Campus Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Campus
              </label>
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-portal-teal-500"
              >
                <option value="all">All Campuses</option>
                <option value="Main Campus">Main Campus</option>
                <option value="Bo Campus">Bo Campus</option>
                <option value="Makeni Campus">Makeni Campus</option>
              </select>
            </div>

            {/* Program Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Program
              </label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-portal-teal-500"
              >
                <option value="all">All Programs</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Medicine">Medicine</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Applicant
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or ID..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-portal-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Applicants Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 border-b-2 border-gray-400">
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 uppercase border-r border-gray-300">
                    S/N
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 uppercase border-r border-gray-300">
                    Application ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 uppercase border-r border-gray-300">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 uppercase border-r border-gray-300">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 uppercase border-r border-gray-300">
                    Campus
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 uppercase border-r border-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplicants.map((applicant, index) => (
                  <tr key={applicant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 border-r border-gray-200">
                      <span className="text-sm text-gray-900">{index + 1}</span>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      <span className="text-sm font-medium text-gray-900">{applicant.applicationId}</span>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      <span className="text-sm text-gray-900">{applicant.fullName}</span>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      <span className="text-sm text-gray-600">{applicant.program}</span>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      <span className="text-sm text-gray-600">{applicant.campus}</span>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      {applicant.offerStatus === 'sent' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Sent
                        </span>
                      )}
                      {applicant.offerStatus === 'generated' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          <FileText className="h-3 w-3" />
                          Generated
                        </span>
                      )}
                      {applicant.offerStatus === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          <Calendar className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePrintOfferLetter(applicant)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Preview & Print"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePrintOfferLetter(applicant)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Print"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSendEmail(applicant)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Send via Email"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredApplicants.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No applicants found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {showPreview && selectedApplicant && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowPreview(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-portal-teal-600 to-portal-teal-700 text-white p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Offer Letter Preview</h2>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-10 rounded transition-colors"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>

                {/* Offer Letter Content */}
                <div className="p-8">
                  <div className="border-2 border-gray-300 rounded-lg p-8 bg-white">
                    {/* University Header */}
                    <div className="text-center mb-8">
                      <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 rounded-full bg-portal-teal-500 flex items-center justify-center">
                          <GraduationCap className="h-12 w-12 text-white" />
                        </div>
                      </div>
                      <h1 className="text-2xl font-bold text-gray-800">
                        ERNEST BAI KOROMA UNIVERSITY OF SCIENCE AND TECHNOLOGY
                      </h1>
                      <p className="text-lg text-gray-600 mt-2">EBKUST</p>
                      <p className="text-sm text-gray-500 mt-1">{selectedApplicant.campus}</p>
                    </div>

                    <div className="border-t-2 border-portal-teal-500 pt-6 mb-6"></div>

                    {/* Letter Date */}
                    <div className="text-right mb-6">
                      <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString('en-GB')}</p>
                    </div>

                    {/* Applicant Details */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-900">{selectedApplicant.fullName}</p>
                      <p className="text-sm text-gray-600">{selectedApplicant.email}</p>
                      <p className="text-sm text-gray-600">{selectedApplicant.phone}</p>
                    </div>

                    {/* Letter Content */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">
                        RE: OFFER OF ADMISSION FOR {selectedApplicant.admissionYear} ACADEMIC YEAR
                      </h3>
                      <p className="text-sm text-gray-700 mb-4">Dear {selectedApplicant.fullName},</p>
                      <p className="text-sm text-gray-700 mb-4">
                        We are pleased to inform you that you have been offered provisional admission to the
                        <strong> {selectedApplicant.program}</strong> program in the <strong>{selectedApplicant.faculty}</strong>
                        faculty at Ernest Bai Koroma University of Science and Technology (EBKUST) for the{' '}
                        <strong>{selectedApplicant.admissionYear}</strong> academic year.
                      </p>
                      <p className="text-sm text-gray-700 mb-4">
                        This offer is subject to verification of your credentials and payment of the required fees.
                        Please report to the admissions office with your original certificates and transcripts within
                        14 days of receiving this letter.
                      </p>
                      <p className="text-sm text-gray-700 mb-4">
                        Your Application ID is: <strong>{selectedApplicant.applicationId}</strong>
                      </p>
                      <p className="text-sm text-gray-700 mb-4">
                        We congratulate you on your admission and look forward to welcoming you to EBKUST.
                      </p>
                    </div>

                    {/* Signature */}
                    <div className="mt-8">
                      <p className="text-sm text-gray-700">Yours sincerely,</p>
                      <div className="mt-6 mb-2">
                        <div className="border-t border-gray-400 w-48"></div>
                      </div>
                      <p className="text-sm font-bold text-gray-800">Registrar</p>
                      <p className="text-sm text-gray-600">EBKUST</p>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleSendEmail(selectedApplicant)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Send Email
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-portal-teal-600 hover:bg-portal-teal-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
