'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { HandshakeIcon, CheckCircle, Clock, XCircle, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface OfferLetter {
  id: string;
  appId: string;
  studentName: string;
  program: string;
  offerDate: string;
  responseDeadline: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Expired';
  email: string;
}

const OFFER_LETTERS: OfferLetter[] = [
  {
    id: '1',
    appId: 'APP2025001',
    studentName: 'FATIMA BANGURA',
    program: 'BSc Nursing',
    offerDate: '2025-01-10',
    responseDeadline: '2025-02-10',
    status: 'Pending',
    email: 'fatima@email.com',
  },
  {
    id: '2',
    appId: 'APP2025002',
    studentName: 'IBRAHIM MANSARAY',
    program: 'MBA',
    offerDate: '2025-01-12',
    responseDeadline: '2025-02-12',
    status: 'Accepted',
    email: 'ibrahim@email.com',
  },
  {
    id: '3',
    appId: 'APP2025003',
    studentName: 'MARIAMA KAMARA',
    program: 'BSc Computer Science',
    offerDate: '2025-01-15',
    responseDeadline: '2025-02-15',
    status: 'Pending',
    email: 'mariama@email.com',
  },
  {
    id: '4',
    appId: 'APP2025004',
    studentName: 'ABDUL SESAY',
    program: 'BSc Microbiology',
    offerDate: '2024-12-20',
    responseDeadline: '2025-01-20',
    status: 'Expired',
    email: 'abdul@email.com',
  },
  {
    id: '5',
    appId: 'APP2025005',
    studentName: 'ZAINAB KOROMA',
    program: 'BSc Mathematics',
    offerDate: '2025-01-18',
    responseDeadline: '2025-02-18',
    status: 'Declined',
    email: 'zainab@email.com',
  },
];

export default function AcceptOfferLetterPage() {
  const [letters] = useState(OFFER_LETTERS);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLetters = letters.filter((letter) => {
    const matchesStatus = filterStatus === 'all' || letter.status === filterStatus;
    const matchesSearch =
      letter.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.appId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSendReminder = (email: string, name: string) => {
    toast.success(`Reminder sent to ${name}`);
  };

  const handleManualAcceptance = (appId: string, name: string) => {
    toast.success(`Manually accepted offer for ${name}`);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      Accepted: 'bg-green-100 text-green-700 border-green-300',
      Declined: 'bg-red-100 text-red-700 border-red-300',
      Expired: 'bg-solid black-100 text-black border-solid black-300',
    };
    return styles[status as keyof typeof styles];
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <HandshakeIcon className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-black">ACCEPT OFFER LETTER</h1>
          </div>
          <p className="text-black">Manage offer letter acceptances and confirmations</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Pending</p>
                <p className="text-3xl font-bold text-black mt-1">
                  {letters.filter((l) => l.status === 'Pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Accepted</p>
                <p className="text-3xl font-bold text-black mt-1">
                  {letters.filter((l) => l.status === 'Accepted').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Declined</p>
                <p className="text-3xl font-bold text-black mt-1">
                  {letters.filter((l) => l.status === 'Declined').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-solid black-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Expired</p>
                <p className="text-3xl font-bold text-black mt-1">
                  {letters.filter((l) => l.status === 'Expired').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-black" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Offer Letters */}
        <div className="space-y-4">
          {filteredLetters.map((letter) => {
            const daysRemaining = getDaysRemaining(letter.responseDeadline);
            return (
              <div
                key={letter.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold text-black">{letter.studentName}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                          letter.status
                        )}`}
                      >
                        {letter.status}
                      </span>
                      {letter.status === 'Pending' && daysRemaining > 0 && (
                        <span className="text-xs text-black">
                          ({daysRemaining} days remaining)
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <p className="text-sm text-black">
                        <span className="font-medium">App ID:</span> {letter.appId}
                      </p>
                      <p className="text-sm text-black">
                        <span className="font-medium">Program:</span> {letter.program}
                      </p>
                      <p className="text-sm text-black">
                        <span className="font-medium">Offer Date:</span> {letter.offerDate}
                      </p>
                      <p className="text-sm text-black">
                        <span className="font-medium">Deadline:</span> {letter.responseDeadline}
                      </p>
                    </div>

                    <p className="text-sm text-black">
                      <span className="font-medium">Email:</span> {letter.email}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    {letter.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleManualAcceptance(letter.appId, letter.studentName)}
                          className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Manual Accept
                        </button>
                        <button
                          onClick={() =>
                            handleSendReminder(letter.email, letter.studentName)
                          }
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          Send Reminder
                        </button>
                      </>
                    )}
                    {letter.status === 'Accepted' && (
                      <div className="text-center text-green-600 font-semibold flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Confirmed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredLetters.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <HandshakeIcon className="w-16 h-16 text-black mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">No Offer Letters Found</h3>
              <p className="text-black">No offer letters match your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
