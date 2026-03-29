'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  UserPlus,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  X,
  FileText,
  ArrowLeft,
  FileSpreadsheet,
  AlertTriangle,
  Users,
  Mail,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ValidationError {
  row: number;
  field: string;
  value: string;
  error: string;
}

interface StudentRecord {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  faculty: string;
  department: string;
  program: string;
  level: string;
  admissionType: string;
  studentType: string;
  academicYear: string;
}

const SAMPLE_PREVIEW_DATA: StudentRecord[] = [
  {
    firstName: 'John',
    middleName: 'Michael',
    lastName: 'Doe',
    dateOfBirth: '15/05/2005',
    gender: 'Male',
    email: 'john.doe@email.com',
    phone: '+232 76 123 456',
    faculty: 'Science',
    department: 'Computer Science',
    program: 'BSc Computer Science',
    level: '100',
    admissionType: 'JAMB/UTME',
    studentType: 'Full-Time',
    academicYear: '2024/2025',
  },
  {
    firstName: 'Jane',
    middleName: 'Mary',
    lastName: 'Smith',
    dateOfBirth: '22/08/2005',
    gender: 'Female',
    email: 'jane.smith@email.com',
    phone: '+232 77 234 567',
    faculty: 'Medicine',
    department: 'Nursing',
    program: 'BSc Nursing',
    level: '100',
    admissionType: 'Direct Entry',
    studentType: 'Full-Time',
    academicYear: '2024/2025',
  },
];

const SAMPLE_VALIDATION_ERRORS: ValidationError[] = [
  {
    row: 3,
    field: 'Email',
    value: 'invalid-email',
    error: 'Invalid email format',
  },
  {
    row: 5,
    field: 'Phone',
    value: '123456',
    error: 'Invalid phone number format. Expected: +232 XX XXX XXXX',
  },
  {
    row: 7,
    field: 'Date of Birth',
    value: '01/01/2010',
    error: 'Student must be at least 16 years old',
  },
];

export default function StudentRegistrationPage() {
  const [registrationType, setRegistrationType] = useState('new');
  const [academicYear, setAcademicYear] = useState('2024/2025');
  const [semester, setSemester] = useState('first');
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [program, setProgram] = useState('');
  const [level, setLevel] = useState('');
  const [studentType, setStudentType] = useState('');
  const [admissionType, setAdmissionType] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [skipErrors, setSkipErrors] = useState(false);
  const [sendWelcomeEmails, setSendWelcomeEmails] = useState(true);
  const [generateIDCards, setGenerateIDCards] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload CSV or Excel file.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit.');
        return;
      }

      setUploadedFile(file);
      toast.success(`File "${file.name}" uploaded successfully!`);
    }
  };

  const handleValidateFile = () => {
    if (!uploadedFile) {
      toast.error('Please upload a file first');
      return;
    }

    // Simulate validation
    setValidationErrors(SAMPLE_VALIDATION_ERRORS);
    setShowPreview(true);
    toast.success('File validated! Review the preview and errors below.');
  };

  const handleDownloadTemplate = () => {
    toast.success('Template downloaded successfully!');
  };

  const handleDownloadErrorReport = () => {
    if (validationErrors.length === 0) {
      toast.error('No errors to export');
      return;
    }
    toast.success('Error report downloaded successfully!');
  };

  const handleImport = async () => {
    if (!uploadedFile) {
      toast.error('No file uploaded');
      return;
    }

    if (validationErrors.length > 0 && !skipErrors) {
      toast.error('Please fix validation errors or enable "Skip errors" option');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    // Simulate import process
    const steps = [
      'Validating data...',
      'Checking for duplicates...',
      'Generating Student IDs...',
      'Creating portal accounts...',
      'Sending welcome emails...',
      'Generating registration report...',
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(steps[i]);
      setProgress(((i + 1) / steps.length) * 100);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setIsProcessing(false);
    toast.success(
      `Successfully registered ${SAMPLE_PREVIEW_DATA.length} students! ${
        validationErrors.length > 0 ? `${validationErrors.length} records skipped.` : ''
      }`
    );

    // Reset form
    setUploadedFile(null);
    setShowPreview(false);
    setValidationErrors([]);
    setProgress(0);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setShowPreview(false);
    setValidationErrors([]);
    toast.success('File removed');
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-black mb-4">
            <Link
              href="/back-office"
              className="text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back Office
            </Link>
            <span className="text-black">/</span>
            <span className="text-black font-medium">Student Registration</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-teal-100 rounded-lg">
              <UserPlus className="w-8 h-8 text-teal-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black">Bulk Student Registration</h1>
              <p className="text-black mt-1">
                Bulk student registration and enrollment processing
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-teal-900">Import Guidelines</p>
            <p className="text-sm text-teal-800 mt-1">
              Download the template file, fill in student data, and upload. All required fields must be
              completed. Maximum file size: 10MB.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Registration Details */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-teal-50 px-6 py-4 border-b border-teal-100">
                <h2 className="text-xl font-bold text-black flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600" />
                  Registration Details
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Registration Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={registrationType}
                      onChange={(e) => setRegistrationType(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="new">New Students</option>
                      <option value="returning">Returning Students</option>
                      <option value="transfer">Transfer Students</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Academic Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="2024/2025">2024/2025</option>
                      <option value="2023/2024">2023/2024</option>
                      <option value="2022/2023">2022/2023</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Semester <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="first">First Semester</option>
                      <option value="second">Second Semester</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Student Type
                    </label>
                    <select
                      value={studentType}
                      onChange={(e) => setStudentType(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">All Types</option>
                      <option value="full-time">Full-Time</option>
                      <option value="part-time">Part-Time</option>
                      <option value="distance">Distance Learning</option>
                      <option value="weekend">Weekend</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Admission Type
                    </label>
                    <select
                      value={admissionType}
                      onChange={(e) => setAdmissionType(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">All Types</option>
                      <option value="jamb">JAMB/UTME</option>
                      <option value="direct">Direct Entry</option>
                      <option value="transfer">Transfer</option>
                      <option value="postgraduate">Postgraduate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Level</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">All Levels</option>
                      <option value="100">100 Level</option>
                      <option value="200">200 Level</option>
                      <option value="300">300 Level</option>
                      <option value="400">400 Level</option>
                      <option value="500">500 Level</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-teal-50 px-6 py-4 border-b border-teal-100">
                <h2 className="text-xl font-bold text-black flex items-center gap-2">
                  <Upload className="w-5 h-5 text-teal-600" />
                  File Upload
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {!uploadedFile ? (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-teal-400 transition-colors">
                    <input
                      type="file"
                      id="fileUpload"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="fileUpload" className="cursor-pointer">
                      <FileSpreadsheet className="w-16 h-16 text-black mx-auto mb-3" />
                      <p className="text-lg text-black font-medium mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-black mb-1">CSV or Excel file (XLSX, XLS)</p>
                      <p className="text-xs text-black">Maximum file size: 10MB</p>
                    </label>
                  </div>
                ) : (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-8 h-8 text-teal-600" />
                        <div>
                          <p className="font-medium text-black">{uploadedFile.name}</p>
                          <p className="text-sm text-black">
                            {(uploadedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleValidateFile}
                    disabled={!uploadedFile}
                    className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 font-semibold disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Validate & Preview
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="skipErrors"
                      checked={skipErrors}
                      onChange={(e) => setSkipErrors(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="skipErrors" className="text-sm text-black">
                      Skip records with errors (partial import)
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sendEmails"
                      checked={sendWelcomeEmails}
                      onChange={(e) => setSendWelcomeEmails(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="sendEmails" className="text-sm text-black">
                      Send welcome emails with portal credentials
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="generateIDs"
                      checked={generateIDCards}
                      onChange={(e) => setGenerateIDCards(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="generateIDs" className="text-sm text-black">
                      Generate student ID cards automatically
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Processing Progress */}
            {isProcessing && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                  <h2 className="text-xl font-bold text-black">Processing...</h2>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-black">{processingStep}</span>
                      <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-black text-center">
                    Please wait while we process the registrations...
                  </p>
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && showPreview && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-black flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Validation Errors ({validationErrors.length})
                  </h2>
                  <button
                    onClick={handleDownloadErrorReport}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download Report
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">
                          Row
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">
                          Field
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">
                          Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">
                          Error
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {validationErrors.map((error, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                            {error.row}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            {error.field}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            {error.value}
                          </td>
                          <td className="px-6 py-4 text-sm text-red-600">{error.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Data Preview */}
            {showPreview && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                  <h2 className="text-xl font-bold text-black flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Data Preview (First 10 Records)
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-black">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-black">DOB</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-black">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-black">Phone</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-black">Program</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-black">Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {SAMPLE_PREVIEW_DATA.map((student, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">{student.dateOfBirth}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{student.email}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{student.phone}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{student.program}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{student.level}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                  <p className="text-sm text-black">
                    Showing preview of {SAMPLE_PREVIEW_DATA.length} records
                  </p>
                  <button
                    onClick={handleImport}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-semibold disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="w-5 h-5" />
                    Confirm & Import
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-teal-50 px-4 py-3 border-b border-teal-100">
                <h3 className="font-semibold text-black">Import Statistics</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-black">Today</span>
                  <span className="text-lg font-bold text-blue-600">45</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-black">This Week</span>
                  <span className="text-lg font-bold text-green-600">287</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-black">This Month</span>
                  <span className="text-lg font-bold text-purple-600">1,245</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm text-black">Failed</span>
                  <span className="text-lg font-bold text-red-600">12</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-teal-50 px-4 py-3 border-b border-teal-100">
                <h3 className="font-semibold text-black">Quick Actions</h3>
              </div>
              <div className="p-4 space-y-2">
                <button
                  onClick={handleDownloadTemplate}
                  className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm">
                  <FileText className="w-4 h-4" />
                  View Import History
                </button>
              </div>
            </div>

            {/* Required Fields Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900 mb-2">Required Fields</p>
                  <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                    <li>First Name, Last Name</li>
                    <li>Date of Birth</li>
                    <li>Gender</li>
                    <li>Email (unique)</li>
                    <li>Phone Number</li>
                    <li>Faculty, Department, Program</li>
                    <li>Level, Academic Year</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
