'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  Key,
  Search,
  Mail,
  Send,
  RotateCw,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PinResetRecord {
  id: string;
  applicationId: string;
  applicantName: string;
  email: string;
  oldPin: string;
  newPin: string;
  resetDate: string;
  resetBy: string;
  reason: string;
  status: 'pending' | 'completed' | 'failed';
}

const SAMPLE_RESET_HISTORY: PinResetRecord[] = [
  {
    id: '1',
    applicationId: 'APP2025001',
    applicantName: 'John Doe',
    email: 'john.doe@email.com',
    oldPin: '****56',
    newPin: '****89',
    resetDate: '2025-03-20 10:30 AM',
    resetBy: 'Admin User',
    reason: 'Forgot PIN',
    status: 'completed',
  },
  {
    id: '2',
    applicationId: 'APP2025002',
    applicantName: 'Jane Smith',
    email: 'jane.smith@email.com',
    oldPin: '****23',
    newPin: '****67',
    resetDate: '2025-03-20 09:15 AM',
    resetBy: 'System Admin',
    reason: 'Security Issue',
    status: 'completed',
  },
];

export default function ResetPinPage() {
  const [searchType, setSearchType] = useState<'appId' | 'email'>('appId');
  const [searchValue, setSearchValue] = useState('');
  const [pinType, setPinType] = useState('application');
  const [resetMode, setResetMode] = useState<'auto' | 'manual'>('auto');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [resetReason, setResetReason] = useState('forgot');
  const [notificationMethod, setNotificationMethod] = useState('email');
  const [sendNotification, setSendNotification] = useState(true);
  const [reasonText, setReasonText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);

  const handleSearch = () => {
    if (!searchValue.trim()) {
      toast.error('Please enter a search value');
      return;
    }

    setShowResults(true);
    toast.success('Applicant found');
  };

  const handleGeneratePin = () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setNewPin(pin);
    setConfirmPin(pin);
    toast.success('PIN generated automatically');
  };

  const handleResetPin = () => {
    if (resetMode === 'manual') {
      if (!newPin || !confirmPin) {
        toast.error('Please enter and confirm the new PIN');
        return;
      }
      if (newPin !== confirmPin) {
        toast.error('PINs do not match');
        return;
      }
      if (newPin.length < 6 || newPin.length > 8) {
        toast.error('PIN must be 6-8 digits');
        return;
      }
    }

    if (!reasonText.trim()) {
      toast.error('Please provide a reason for reset');
      return;
    }

    toast.success('PIN reset successfully!');
    setShowResults(false);
    setSearchValue('');
    setNewPin('');
    setConfirmPin('');
    setReasonText('');
  };

  const handleBulkReset = () => {
    if (selectedApplicants.length === 0) {
      toast.error('Please select applicants to reset');
      return;
    }

    toast.success(`${selectedApplicants.length} PINs reset successfully!`);
    setSelectedApplicants([]);
  };

  const handleExport = () => {
    toast.success('Reset history exported successfully!');
  };

  const toggleApplicantSelection = (id: string) => {
    setSelectedApplicants((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-solid black-100 text-black';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-black mb-4">
            <Link href="/back-office" className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back Office
            </Link>
            <span className="text-black">/</span>
            <span className="text-black font-medium">Reset Pin Password</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Key className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black">Reset Pin Password</h1>
              <p className="text-black mt-1">
                Reset application PIN passwords for online applicants
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">Security Notice</p>
            <p className="text-sm text-blue-800 mt-1">
              All PIN reset operations are logged and audited. Ensure you have proper authorization before proceeding.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reset Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                <h2 className="text-xl font-bold text-black flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-600" />
                  PIN Reset Form
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Search Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">Search Applicant</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Search By <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value as 'appId' | 'email')}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="appId">Application ID</option>
                        <option value="email">Email Address</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        {searchType === 'appId' ? 'Application ID' : 'Email Address'} <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type={searchType === 'email' ? 'email' : 'text'}
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          placeholder={searchType === 'appId' ? 'Enter Application ID' : 'Enter Email Address'}
                          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={handleSearch}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Search className="w-4 h-4" />
                          Search
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {showResults && (
                  <>
                    {/* Applicant Info */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-3 mb-3">
                        <User className="w-5 h-5 text-black" />
                        <h4 className="font-semibold text-black">Applicant Information</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-black">Application ID:</span>
                          <span className="ml-2 font-medium text-black">APP2025001</span>
                        </div>
                        <div>
                          <span className="text-black">Name:</span>
                          <span className="ml-2 font-medium text-black">John Doe</span>
                        </div>
                        <div>
                          <span className="text-black">Email:</span>
                          <span className="ml-2 font-medium text-black">john.doe@email.com</span>
                        </div>
                        <div>
                          <span className="text-black">Program:</span>
                          <span className="ml-2 font-medium text-black">Computer Science</span>
                        </div>
                      </div>
                    </div>

                    {/* Reset Options */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-black">Reset Options</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">
                            PIN Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={pinType}
                            onChange={(e) => setPinType(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="application">Application PIN</option>
                            <option value="login">Login PIN</option>
                            <option value="both">Both PINs</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-black mb-2">
                            Reset Mode <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={resetMode}
                            onChange={(e) => setResetMode(e.target.value as 'auto' | 'manual')}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="auto">Auto-Generate PIN</option>
                            <option value="manual">Manual PIN Entry</option>
                          </select>
                        </div>
                      </div>

                      {resetMode === 'manual' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">
                              New PIN (6-8 digits) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={newPin}
                              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                              placeholder="Enter new PIN"
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-black mb-2">
                              Confirm PIN <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={confirmPin}
                              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                              placeholder="Confirm new PIN"
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      )}

                      {resetMode === 'auto' && (
                        <button
                          onClick={handleGeneratePin}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <RotateCw className="w-4 h-4" />
                          Generate PIN
                        </button>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">
                            Reset Reason <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={resetReason}
                            onChange={(e) => setResetReason(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="forgot">Forgot PIN</option>
                            <option value="security">Security Issue</option>
                            <option value="administrative">Administrative</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-black mb-2">
                            Notification Method
                          </label>
                          <select
                            value={notificationMethod}
                            onChange={(e) => setNotificationMethod(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={!sendNotification}
                          >
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                            <option value="both">Both</option>
                            <option value="none">None</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Additional Notes <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={reasonText}
                          onChange={(e) => setReasonText(e.target.value)}
                          placeholder="Provide detailed reason for PIN reset..."
                          rows={3}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="sendNotification"
                          checked={sendNotification}
                          onChange={(e) => setSendNotification(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="sendNotification" className="text-sm text-black">
                          Send notification to applicant
                        </label>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                      <button
                        onClick={handleResetPin}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                      >
                        <Key className="w-5 h-5" />
                        Reset PIN
                      </button>
                      <button
                        onClick={() => {
                          setShowResults(false);
                          setSearchValue('');
                          setNewPin('');
                          setConfirmPin('');
                          setReasonText('');
                        }}
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

          {/* Statistics & Quick Actions */}
          <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                <h3 className="font-semibold text-black">Statistics</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-black">Today's Resets</span>
                  <span className="text-lg font-bold text-blue-600">12</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-black">This Week</span>
                  <span className="text-lg font-bold text-green-600">47</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-black">This Month</span>
                  <span className="text-lg font-bold text-purple-600">156</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm text-black">Pending</span>
                  <span className="text-lg font-bold text-orange-600">3</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                <h3 className="font-semibold text-black">Quick Actions</h3>
              </div>
              <div className="p-4 space-y-2">
                <button
                  onClick={handleBulkReset}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCw className="w-4 h-4" />
                  Bulk PIN Reset
                </button>
                <button
                  onClick={handleExport}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export History
                </button>
                <button className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 text-sm">
                  <FileText className="w-4 h-4" />
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reset History */}
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-black flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Recent Reset History
            </h2>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                    Application ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                    Applicant Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                    Reset Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                    Reset By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SAMPLE_RESET_HISTORY.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {record.applicationId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {record.applicantName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {record.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {record.resetDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {record.resetBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {record.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          record.status
                        )}`}
                      >
                        {getStatusIcon(record.status)}
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
