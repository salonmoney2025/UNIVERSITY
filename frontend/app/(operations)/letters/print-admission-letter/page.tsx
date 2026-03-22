'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FileCheck, Printer, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface StudentRecord {
  id: string;
  studentId: string;
  name: string;
  course: string;
  year: string;
  level: number;
  campus: string;
  admissionDate: string;
  status: 'Confirmed' | 'Pending' | 'Rejected';
}

// Sample admitted student data
const ADMITTED_STUDENTS: StudentRecord[] = [
  {
    id: '1',
    studentId: 'STU2024001',
    name: 'ELIZABETH KAMBAIMA',
    course: 'Bachelor of Science in Nursing',
    year: '2024-2025',
    level: 1,
    campus: 'Main Campus',
    admissionDate: '2024-09-01',
    status: 'Confirmed',
  },
  {
    id: '2',
    studentId: 'STU2024002',
    name: 'AMARA KOROMA',
    course: 'Bachelor of Science in Computer Science',
    year: '2024-2025',
    level: 1,
    campus: 'Main Campus',
    admissionDate: '2024-09-01',
    status: 'Confirmed',
  },
  {
    id: '3',
    studentId: 'STU2024003',
    name: 'ISATA JALLOH',
    course: 'Bachelor of Science in Microbiology',
    year: '2024-2025',
    level: 1,
    campus: 'Main Campus',
    admissionDate: '2024-09-05',
    status: 'Confirmed',
  },
  {
    id: '4',
    studentId: 'STU2024004',
    name: 'MUSTAPHA SESAY',
    course: 'Bachelor of Science in Computer Science',
    year: '2024-2025',
    level: 1,
    campus: 'Main Campus',
    admissionDate: '2024-09-10',
    status: 'Confirmed',
  },
  {
    id: '5',
    studentId: 'STU2025001',
    name: 'MARIAMA KAMARA',
    course: 'Bachelor of Science in Nursing',
    year: '2025-2026',
    level: 1,
    campus: 'Main Campus',
    admissionDate: '2025-01-15',
    status: 'Confirmed',
  },
  {
    id: '6',
    studentId: 'STU2025002',
    name: 'MOHAMED TURAY',
    course: 'Master of Business Administration',
    year: '2025-2026',
    level: 1,
    campus: 'Main Campus',
    admissionDate: '2025-01-15',
    status: 'Pending',
  },
  {
    id: '7',
    studentId: 'STU2025003',
    name: 'HAWA KOROMA',
    course: 'Bachelor of Science in Nursing',
    year: '2025-2026',
    level: 1,
    campus: 'Main Campus',
    admissionDate: '2025-01-20',
    status: 'Confirmed',
  },
  {
    id: '8',
    studentId: 'STU2025004',
    name: 'JOSEPH BANGURA',
    course: 'Bachelor of Science in Mathematics',
    year: '2025-2026',
    level: 1,
    campus: 'Main Campus',
    admissionDate: '2025-01-20',
    status: 'Confirmed',
  },
];

const ACADEMIC_YEARS = ['2024-2025', '2025-2026', '2026-2027'];
const CAMPUSES = ['Main Campus', 'City Campus', 'Medical Campus'];
const STATUSES = ['All', 'Confirmed', 'Pending', 'Rejected'];

export default function PrintAdmissionLetterPage() {
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [selectedCampus, setSelectedCampus] = useState('Main Campus');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showResults, setShowResults] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and search students
  const filteredStudents = useMemo(() => {
    return ADMITTED_STUDENTS.filter((student) => {
      const matchesYear = student.year === academicYear;
      const matchesCampus = student.campus === selectedCampus;
      const matchesStatus = selectedStatus === 'All' || student.status === selectedStatus;
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.course.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesYear && matchesCampus && matchesStatus && matchesSearch;
    });
  }, [academicYear, selectedCampus, selectedStatus, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedStudents = filteredStudents.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  const handleShow = () => {
    setShowResults(true);
    setCurrentPage(1);
    toast.success(`Found ${filteredStudents.length} admitted student(s)`);
  };

  const handlePrintAdmissionLetter = (studentId: string, studentName: string) => {
    toast.success(`Printing admission letter for ${studentName}`);
    // Implement actual print functionality here
  };

  const handleBulkPrint = () => {
    if (filteredStudents.length === 0) {
      toast.error('No students to print');
      return;
    }
    toast.success(`Printing ${filteredStudents.length} admission letters`);
    // Implement bulk print functionality here
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Confirmed: 'bg-green-100 text-green-700',
      Pending: 'bg-yellow-100 text-yellow-700',
      Rejected: 'bg-red-100 text-red-700',
    };
    return styles[status as keyof typeof styles] || styles.Pending;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-black mb-4">
            <span className="text-black">Print Admission Letter Here</span>
            <span className="text-black">/</span>
            <a href="/letters" className="text-blue-600 hover:text-blue-700">
              Letters
            </a>
            <span className="text-black">/</span>
            <a href="/" className="text-blue-600 hover:text-blue-700">
              Home
            </a>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <FileCheck className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-black">
              PRINT ADMISSION LETTER
            </h1>
          </div>
          <p className="text-black">
            Select filters to view and print student admission letters
          </p>
        </div>

        {/* Filter Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-black mb-6">
            Filter Criteria
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Academic Year */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Academic Year
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              >
                {ACADEMIC_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Campus */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Select Campus
              </label>
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              >
                {CAMPUSES.map((campus) => (
                  <option key={campus} value={campus}>
                    {campus}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Admission Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={handleShow}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-200 flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              Show
            </button>
            {showResults && filteredStudents.length > 0 && (
              <button
                onClick={handleBulkPrint}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Bulk Print All
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Table Controls */}
            <div className="border-b border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-black">
                  Show
                </label>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <label className="text-sm font-medium text-black">
                  entries
                </label>
              </div>

              <div className="w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search by name, ID, or course..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                      Admission Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-black">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.length > 0 ? (
                    paginatedStudents.map((student, index) => (
                      <tr
                        key={student.id}
                        className={`border-b border-slate-100 hover:bg-green-50 transition ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                        }`}
                      >
                        <td className="px-6 py-4 text-sm text-black font-medium">
                          {student.studentId}
                        </td>
                        <td className="px-6 py-4 text-sm text-black">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-black">
                          {student.course}
                        </td>
                        <td className="px-6 py-4 text-sm text-black">
                          {student.admissionDate}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                              student.status
                            )}`}
                          >
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() =>
                              handlePrintAdmissionLetter(
                                student.studentId,
                                student.name
                              )
                            }
                            className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition text-sm font-medium"
                            title="Print Admission Letter"
                          >
                            <Printer className="w-4 h-4" />
                            Print
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-black"
                      >
                        <p className="text-lg font-medium">
                          No records found matching the selected criteria
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredStudents.length > 0 && (
              <div className="border-t border-slate-200 px-6 py-4 flex justify-between items-center">
                <p className="text-sm text-black">
                  Showing {startIndex + 1} to{' '}
                  {Math.min(startIndex + entriesPerPage, filteredStudents.length)}{' '}
                  of {filteredStudents.length} entries
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                            currentPage === page
                              ? 'bg-green-600 text-white'
                              : 'border border-slate-300 text-black hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!showResults && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileCheck className="w-16 h-16 text-black mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-black mb-2">
              No Results Yet
            </h3>
            <p className="text-black">
              Select your filters and click the "Show" button to view student
              admission letters
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
