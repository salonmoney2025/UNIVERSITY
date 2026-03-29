'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  Calendar,
  Search,
  Send,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  ArrowLeft,
  Users,
  Plus,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PinRecord {
  id: string;
  pinNumber: string;
  applicantName: string;
  program: string;
  faculty: string;
  currentDeadline: string;
  status: 'active' | 'expired' | 'extended';
}

const SAMPLE_PINS: PinRecord[] = [
  {
    id: '1',
    pinNumber: 'PIN2025001',
    applicantName: 'John Doe',
    program: 'Computer Science',
    faculty: 'Science',
    currentDeadline: '2025-03-25',
    status: 'active',
  },
  {
    id: '2',
    pinNumber: 'PIN2025002',
    applicantName: 'Jane Smith',
    program: 'Nursing',
    faculty: 'Medicine',
    currentDeadline: '2025-03-25',
    status: 'active',
  },
  {
    id: '3',
    pinNumber: 'PIN2025003',
    applicantName: 'Mike Johnson',
    program: 'Civil Engineering',
    faculty: 'Engineering',
    currentDeadline: '2025-03-25',
    status: 'active',
  },
];

const FACULTIES = [
  'All Faculties',
  'Science',
  'Engineering',
  'Arts',
  'Social Sciences',
  'Medicine',
  'Business Administration',
];

const PROGRAMS: Record<string, string[]> = {
  Science: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology'],
  Engineering: ['Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering'],
  Arts: ['English', 'History', 'Fine Arts'],
  'Social Sciences': ['Economics', 'Sociology', 'Political Science'],
  Medicine: ['Medicine', 'Nursing', 'Pharmacy'],
  'Business Administration': ['Accounting', 'Marketing', 'Management'],
};

export default function ExtendDeadlinePage() {
  const [extensionType, setExtensionType] = useState('individual');
  const [selectedFaculty, setSelectedFaculty] = useState('All Faculties');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [academicYear, setAcademicYear] = useState('2024/2025');
  const [semester, setSemester] = useState('first');
  const [extensionDuration, setExtensionDuration] = useState('7');
  const [customDays, setCustomDays] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [includeWeekends, setIncludeWeekends] = useState(true);
  const [notifyApplicants, setNotifyApplicants] = useState(true);
  const [reasonText, setReasonText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPins, setSelectedPins] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const availablePrograms = useMemo(() => {
    if (selectedFaculty === 'All Faculties') return [];
    return PROGRAMS[selectedFaculty] || [];
  }, [selectedFaculty]);

  const filteredPins = useMemo(() => {
    return SAMPLE_PINS.filter((pin) => {
      const matchesFaculty = selectedFaculty === 'All Faculties' || pin.faculty === selectedFaculty;
      const matchesProgram = !selectedProgram || pin.program === selectedProgram;
      const matchesSearch =
        pin.pinNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pin.applicantName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFaculty && matchesProgram && matchesSearch;
    });
  }, [selectedFaculty, selectedProgram, searchTerm]);

  const handleSearch = () => {
    setShowResults(true);
    toast.success(`Found ${filteredPins.length} PIN(s)`);
  };

  const togglePinSelection = (id: string) => {
    setSelectedPins((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPins.length === filteredPins.length) {
      setSelectedPins([]);
    } else {
      setSelectedPins(filteredPins.map((pin) => pin.id));
    }
  };

  const calculateNewDeadline = () => {
    const days = extensionDuration === 'custom' ? parseInt(customDays) : parseInt(extensionDuration);
    if (isNaN(days)) {
      toast.error('Please enter a valid number of days');
      return;
    }

    const currentDate = new Date();
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);

    setNewDeadline(newDate.toISOString().split('T')[0]);
    toast.success(`New deadline calculated: ${newDate.toLocaleDateString()}`);
  };

  const handleExtendDeadline = () => {
    if (selectedPins.length === 0) {
      toast.error('Please select at least one PIN to extend');
      return;
    }

    if (!newDeadline) {
      toast.error('Please calculate or select a new deadline');
      return;
    }

    if (!reasonText.trim()) {
      toast.error('Please provide a reason for extension');
      return;
    }

    const pastDate = new Date(newDeadline) < new Date();
    if (pastDate) {
      toast.error('Cannot extend to a past date');
      return;
    }

    toast.success(`${selectedPins.length} PIN(s) deadline extended successfully!`);
    setSelectedPins([]);
    setReasonText('');
    setNewDeadline('');
  };

  const handleExport = () => {
    toast.success('Extension history exported successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'extended':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-solid black-100 text-black';
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-black mb-4">
            <Link href="/back-office" className="text-green-600 hover:text-green-700 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back Office
            </Link>
            <span className="text-black">/</span>
            <span className="text-black font-medium">Extend Pin Deadline</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black">Extend Pin Deadline</h1>
              <p className="text-black mt-1">
                Extend PIN validity period and application deadlines
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-900">Extension Notice</p>
            <p className="text-sm text-green-800 mt-1">
              Maximum extension period is 90 days. All extensions require proper justification and approval.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Extension Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                <h2 className="text-xl font-bold text-black flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Deadline Extension Form
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Extension Type */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Extension Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={extensionType}
                    onChange={(e) => setExtensionType(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="individual">Individual PIN</option>
                    <option value="bulk">Bulk PINs</option>
                    <option value="program">By Program</option>
                    <option value="faculty">By Faculty</option>
                  </select>
                </div>

                {/* Filter Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                    <Filter className="w-5 h-5 text-green-600" />
                    Filter Criteria
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Academic Year
                      </label>
                      <select
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="2024/2025">2024/2025</option>
                        <option value="2023/2024">2023/2024</option>
                        <option value="2022/2023">2022/2023</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Semester
                      </label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="first">First Semester</option>
                        <option value="second">Second Semester</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Faculty
                      </label>
                      <select
                        value={selectedFaculty}
                        onChange={(e) => {
                          setSelectedFaculty(e.target.value);
                          setSelectedProgram('');
                        }}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {FACULTIES.map((faculty) => (
                          <option key={faculty} value={faculty}>
                            {faculty}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Program
                      </label>
                      <select
                        value={selectedProgram}
                        onChange={(e) => setSelectedProgram(e.target.value)}
                        disabled={selectedFaculty === 'All Faculties'}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-slate-100"
                      >
                        <option value="">All Programs</option>
                        {availablePrograms.map((program) => (
                          <option key={program} value={program}>
                            {program}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Search PIN / Applicant Name
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by PIN number or name..."
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Search className="w-4 h-4" />
                        Search
                      </button>
                    </div>
                  </div>
                </div>

                {/* Extension Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">Extension Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Extension Duration <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={extensionDuration}
                        onChange={(e) => setExtensionDuration(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="7">7 Days</option>
                        <option value="14">14 Days</option>
                        <option value="30">30 Days</option>
                        <option value="60">60 Days</option>
                        <option value="90">90 Days</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>

                    {extensionDuration === 'custom' && (
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Custom Days <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={customDays}
                          onChange={(e) => setCustomDays(e.target.value)}
                          placeholder="Enter number of days"
                          min="1"
                          max="90"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        New Deadline <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={newDeadline}
                          onChange={(e) => setNewDeadline(e.target.value)}
                          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <button
                          onClick={calculateNewDeadline}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                          <Plus className="w-4 h-4" />
                          Calculate
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Reason for Extension <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reasonText}
                      onChange={(e) => setReasonText(e.target.value)}
                      placeholder="Provide detailed justification for deadline extension..."
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="includeWeekends"
                        checked={includeWeekends}
                        onChange={(e) => setIncludeWeekends(e.target.checked)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <label htmlFor="includeWeekends" className="text-sm text-black">
                        Include weekends in calculation
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="notifyApplicants"
                        checked={notifyApplicants}
                        onChange={(e) => setNotifyApplicants(e.target.checked)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <label htmlFor="notifyApplicants" className="text-sm text-black">
                        Notify applicants via email
                      </label>
                    </div>
                  </div>
                </div>

                {/* PIN Selection Table */}
                {showResults && filteredPins.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-black">
                        Select PINs ({selectedPins.length} selected)
                      </h3>
                      <button
                        onClick={toggleSelectAll}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        {selectedPins.length === filteredPins.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-black">
                                Select
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-black">
                                PIN Number
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-black">
                                Applicant
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-black">
                                Program
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-black">
                                Current Deadline
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-black">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredPins.map((pin) => (
                              <tr key={pin.id} className="hover:bg-slate-50">
                                <td className="px-4 py-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedPins.includes(pin.id)}
                                    onChange={() => togglePinSelection(pin.id)}
                                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                  />
                                </td>
                                <td className="px-4 py-2 text-sm font-medium text-black">
                                  {pin.pinNumber}
                                </td>
                                <td className="px-4 py-2 text-sm text-black">{pin.applicantName}</td>
                                <td className="px-4 py-2 text-sm text-black">{pin.program}</td>
                                <td className="px-4 py-2 text-sm text-black">
                                  {new Date(pin.currentDeadline).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2">
                                  <span
                                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                      pin.status
                                    )}`}
                                  >
                                    {pin.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={handleExtendDeadline}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                  >
                    <Calendar className="w-5 h-5" />
                    Extend Deadline
                  </button>
                  <button
                    onClick={() => {
                      setShowResults(false);
                      setSelectedPins([]);
                      setReasonText('');
                      setNewDeadline('');
                    }}
                    className="px-6 py-3 bg-slate-200 text-black rounded-lg hover:bg-slate-300 transition-colors font-semibold"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics & Quick Info */}
          <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-green-50 px-4 py-3 border-b border-green-100">
                <h3 className="font-semibold text-black">Extension Statistics</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-black">Active PINs</span>
                  <span className="text-lg font-bold text-green-600">2,345</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm text-black">Expiring Soon</span>
                  <span className="text-lg font-bold text-yellow-600">89</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-black">Extended This Week</span>
                  <span className="text-lg font-bold text-blue-600">47</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-black">This Month</span>
                  <span className="text-lg font-bold text-purple-600">156</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-green-50 px-4 py-3 border-b border-green-100">
                <h3 className="font-semibold text-black">Quick Actions</h3>
              </div>
              <div className="p-4 space-y-2">
                <button
                  onClick={handleExport}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export History
                </button>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm">
                  <Users className="w-4 h-4" />
                  View All PINs
                </button>
              </div>
            </div>

            {/* Extension Limits */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900">Extension Limits</p>
                  <ul className="text-sm text-yellow-800 mt-2 space-y-1 list-disc list-inside">
                    <li>Maximum: 90 days</li>
                    <li>No past dates</li>
                    <li>Requires justification</li>
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
