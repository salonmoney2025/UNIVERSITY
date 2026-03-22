'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  RefreshCw,
  Search,
  User,
  Download,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  FileText,
  Upload,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ApplicantData {
  id: string;
  applicationId: string;
  name: string;
  email: string;
  phone: string;
  currentFaculty: string;
  currentDepartment: string;
  currentProgram: string;
  admissionYear: string;
  level: string;
}

const FACULTIES = [
  'Science',
  'Engineering',
  'Arts',
  'Social Sciences',
  'Medicine',
  'Business Administration',
];

const DEPARTMENTS: Record<string, string[]> = {
  Science: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Microbiology'],
  Engineering: ['Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Chemical Engineering'],
  Arts: ['English', 'History', 'Fine Arts', 'Music', 'Theatre Arts'],
  'Social Sciences': ['Economics', 'Sociology', 'Political Science', 'Psychology', 'Geography'],
  Medicine: ['Medicine', 'Nursing', 'Pharmacy', 'Medical Laboratory Science'],
  'Business Administration': ['Accounting', 'Marketing', 'Management', 'Finance', 'Banking'],
};

const PROGRAMS: Record<string, string[]> = {
  'Computer Science': ['BSc Computer Science', 'MSc Computer Science', 'PhD Computer Science'],
  Mathematics: ['BSc Mathematics', 'MSc Mathematics', 'PhD Mathematics'],
  Physics: ['BSc Physics', 'MSc Physics', 'PhD Physics'],
  Chemistry: ['BSc Chemistry', 'MSc Chemistry', 'PhD Chemistry'],
  'Civil Engineering': ['BEng Civil Engineering', 'MEng Civil Engineering'],
  'Electrical Engineering': ['BEng Electrical Engineering', 'MEng Electrical Engineering'],
  Nursing: ['BSc Nursing', 'MSc Nursing'],
  Medicine: ['MBBS Medicine', 'MD Medicine'],
  Accounting: ['BSc Accounting', 'MSc Accounting'],
  Marketing: ['BSc Marketing', 'MSc Marketing'],
};

const SAMPLE_APPLICANT: ApplicantData = {
  id: '1',
  applicationId: 'APP2025001',
  name: 'John Doe',
  email: 'john.doe@email.com',
  phone: '+232 76 123 456',
  currentFaculty: 'Science',
  currentDepartment: 'Mathematics',
  currentProgram: 'BSc Mathematics',
  admissionYear: '2024/2025',
  level: '100',
};

export default function TransferApplicantPage() {
  const [searchType, setSearchType] = useState<'id' | 'name'>('id');
  const [searchValue, setSearchValue] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [applicantData, setApplicantData] = useState<ApplicantData | null>(null);

  // New program selection
  const [newFaculty, setNewFaculty] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newProgram, setNewProgram] = useState('');
  const [newAdmissionYear, setNewAdmissionYear] = useState('2024/2025');

  // Transfer options
  const [transferType, setTransferType] = useState('program');
  const [transferReason, setTransferReason] = useState('academic');
  const [transferDocuments, setTransferDocuments] = useState(true);
  const [transferPayments, setTransferPayments] = useState(true);
  const [transferCourseUnits, setTransferCourseUnits] = useState(false);
  const [reasonText, setReasonText] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const newDepartments = useMemo(() => {
    return newFaculty ? DEPARTMENTS[newFaculty] || [] : [];
  }, [newFaculty]);

  const newPrograms = useMemo(() => {
    return newDepartment ? PROGRAMS[newDepartment] || [] : [];
  }, [newDepartment]);

  const handleSearch = () => {
    if (!searchValue.trim()) {
      toast.error('Please enter a search value');
      return;
    }

    // Simulate search
    setApplicantData(SAMPLE_APPLICANT);
    setShowResults(true);
    toast.success('Applicant found');
  };

  const handleFacultyChange = (faculty: string) => {
    setNewFaculty(faculty);
    setNewDepartment('');
    setNewProgram('');
  };

  const handleDepartmentChange = (department: string) => {
    setNewDepartment(department);
    setNewProgram('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...files]);
      toast.success(`${files.length} file(s) added`);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    toast.success('File removed');
  };

  const handleTransfer = () => {
    if (!applicantData) {
      toast.error('No applicant selected');
      return;
    }

    if (!newFaculty || !newDepartment || !newProgram) {
      toast.error('Please select complete new program details');
      return;
    }

    if (!reasonText.trim()) {
      toast.error('Please provide a reason for transfer');
      return;
    }

    // Check if transferring to same program
    if (
      newFaculty === applicantData.currentFaculty &&
      newDepartment === applicantData.currentDepartment &&
      newProgram === applicantData.currentProgram
    ) {
      toast.error('Cannot transfer to the same program');
      return;
    }

    toast.success('Transfer request submitted successfully!');
    resetForm();
  };

  const resetForm = () => {
    setShowResults(false);
    setSearchValue('');
    setApplicantData(null);
    setNewFaculty('');
    setNewDepartment('');
    setNewProgram('');
    setReasonText('');
    setAdditionalNotes('');
    setAttachments([]);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-black mb-4">
            <Link
              href="/back-office"
              className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back Office
            </Link>
            <span className="text-black">/</span>
            <span className="text-black font-medium">Transfer Applicants</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-100 rounded-lg">
              <RefreshCw className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black">Transfer Applicants</h1>
              <p className="text-black mt-1">
                Transfer applicants between programs and admission cycles
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-purple-900">Transfer Notice</p>
            <p className="text-sm text-purple-800 mt-1">
              All transfers require approval and proper documentation. Eligibility checks will be performed automatically.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
            <h2 className="text-xl font-bold text-black flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-600" />
              Transfer Application Form
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Search Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">Search Applicant</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Search By <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as 'id' | 'name')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="id">Application ID</option>
                    <option value="name">Applicant Name</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">
                    {searchType === 'id' ? 'Application ID' : 'Applicant Name'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder={searchType === 'id' ? 'Enter Application ID' : 'Enter Applicant Name'}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSearch}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {showResults && applicantData && (
              <>
                {/* Current Program Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-600" />
                    Current Program Details
                  </h3>

                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-black">Application ID</p>
                        <p className="font-medium text-black">{applicantData.applicationId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-black">Full Name</p>
                        <p className="font-medium text-black">{applicantData.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-black">Email</p>
                        <p className="font-medium text-black">{applicantData.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-black">Phone</p>
                        <p className="font-medium text-black">{applicantData.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-black">Current Faculty</p>
                        <p className="font-medium text-black">{applicantData.currentFaculty}</p>
                      </div>
                      <div>
                        <p className="text-sm text-black">Current Department</p>
                        <p className="font-medium text-black">{applicantData.currentDepartment}</p>
                      </div>
                      <div>
                        <p className="text-sm text-black">Current Program</p>
                        <p className="font-medium text-black">{applicantData.currentProgram}</p>
                      </div>
                      <div>
                        <p className="text-sm text-black">Admission Year</p>
                        <p className="font-medium text-black">{applicantData.admissionYear}</p>
                      </div>
                      <div>
                        <p className="text-sm text-black">Level</p>
                        <p className="font-medium text-black">{applicantData.level}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center py-2">
                  <ArrowRight className="w-8 h-8 text-purple-600" />
                </div>

                {/* New Program Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">New Program Selection</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Transfer Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={transferType}
                        onChange={(e) => setTransferType(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="program">Program Change</option>
                        <option value="faculty">Faculty Change</option>
                        <option value="cycle">Admission Cycle Change</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Transfer Reason <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={transferReason}
                        onChange={(e) => setTransferReason(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="academic">Academic Reasons</option>
                        <option value="personal">Personal Reasons</option>
                        <option value="administrative">Administrative</option>
                        <option value="financial">Financial Reasons</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        New Faculty <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newFaculty}
                        onChange={(e) => handleFacultyChange(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select Faculty</option>
                        {FACULTIES.map((faculty) => (
                          <option key={faculty} value={faculty}>
                            {faculty}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        New Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newDepartment}
                        onChange={(e) => handleDepartmentChange(e.target.value)}
                        disabled={!newFaculty}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-slate-100"
                      >
                        <option value="">Select Department</option>
                        {newDepartments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        New Program <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newProgram}
                        onChange={(e) => setNewProgram(e.target.value)}
                        disabled={!newDepartment}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-slate-100"
                      >
                        <option value="">Select Program</option>
                        {newPrograms.map((program) => (
                          <option key={program} value={program}>
                            {program}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Admission Year
                      </label>
                      <select
                        value={newAdmissionYear}
                        onChange={(e) => setNewAdmissionYear(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="2024/2025">2024/2025</option>
                        <option value="2023/2024">2023/2024</option>
                        <option value="2022/2023">2022/2023</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Transfer Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">Transfer Options</h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="transferDocuments"
                        checked={transferDocuments}
                        onChange={(e) => setTransferDocuments(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="transferDocuments" className="text-sm text-black">
                        Transfer documents and credentials
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="transferPayments"
                        checked={transferPayments}
                        onChange={(e) => setTransferPayments(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="transferPayments" className="text-sm text-black">
                        Transfer payment records
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="transferCourseUnits"
                        checked={transferCourseUnits}
                        onChange={(e) => setTransferCourseUnits(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="transferCourseUnits" className="text-sm text-black">
                        Transfer course units and credits
                      </label>
                    </div>
                  </div>
                </div>

                {/* Reason and Notes */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Reason for Transfer <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reasonText}
                      onChange={(e) => setReasonText(e.target.value)}
                      placeholder="Provide detailed reason for transfer request..."
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Any additional information or special circumstances..."
                      rows={2}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* File Attachments */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-black">Supporting Documents</h3>

                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      id="fileUpload"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="fileUpload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-black mx-auto mb-2" />
                      <p className="text-sm text-black mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-black">PDF, DOC, DOCX, JPG, PNG (max 5MB each)</p>
                    </label>
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-black" />
                            <span className="text-sm text-black">{file.name}</span>
                            <span className="text-xs text-black">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <button
                            onClick={() => removeAttachment(index)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={handleTransfer}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Submit Transfer Request
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-slate-200 text-black rounded-lg hover:bg-slate-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
