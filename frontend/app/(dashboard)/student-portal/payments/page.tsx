'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Download, Search, Filter, Calendar, DollarSign,
  Receipt, ArrowLeft, FileText
} from 'lucide-react';
import { generateReceiptPDF } from '@/lib/pdf-generator';

interface Payment {
  id: string;
  receiptNo: string;
  studentName: string;
  paymentType: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  transactionRef?: string;
  academicYear: string;
  semester: string;
  description?: string;
  status: string;
  bank?: {
    bankName: string;
  };
}

export default function StudentPaymentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (user?.role !== 'STUDENT') {
      router.push('/dashboard');
      return;
    }
    fetchPayments();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterStatus, filterType, payments]);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments');
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      const data = await response.json();
      setPayments(data);
      setFilteredPayments(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.paymentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.transactionRef?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((p) => p.status === filterStatus);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((p) => p.paymentType === filterType);
    }

    setFilteredPayments(filtered);
  };

  const handleDownloadReceipt = (payment: Payment) => {
    try {
      generateReceiptPDF({
        receiptNo: payment.receiptNo,
        studentName: payment.studentName,
        studentId: user?.studentId || '',
        amount: payment.amount,
        paymentType: payment.paymentType,
        paymentMethod: payment.paymentMethod,
        paymentDate: new Date(payment.paymentDate),
        transactionRef: payment.transactionRef,
        bankName: payment.bank?.bankName,
        academicYear: payment.academicYear,
        semester: payment.semester,
      });
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SL', {
      style: 'currency',
      currency: 'NSL',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalPaid = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const paymentTypes = [...new Set(payments.map((p) => p.paymentType))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-black">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-solid black-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/student/dashboard')}
            className="flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">Payment History</h1>
              <p className="mt-1 text-sm text-black">
                View and download all your payment receipts
              </p>
            </div>
            <div className="bg-indigo-50 px-4 py-3 rounded-lg">
              <p className="text-sm text-indigo-600 font-medium">Total Paid</p>
              <p className="text-2xl font-bold text-indigo-900">
                {formatCurrency(totalPaid)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-solid black-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by receipt number or transaction ref..."
                  className="pl-10 w-full px-4 py-2 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Payment Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {paymentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-black">
              Showing {filteredPayments.length} of {payments.length} payments
            </p>
            {(searchTerm || filterStatus !== 'all' || filterType !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterType('all');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-solid black-200">
          {filteredPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-solid black-200">
                <thead className="bg-solid black-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Receipt No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Payment Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Academic Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-solid black-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-solid black-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Receipt className="h-4 w-4 text-indigo-600 mr-2" />
                          <span className="text-sm font-medium text-indigo-600">
                            {payment.receiptNo}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {payment.paymentType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-black">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {payment.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {payment.academicYear} - {payment.semester}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : payment.status === 'verified'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-solid black-100 text-black'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDownloadReceipt(payment)}
                          className="inline-flex items-center px-3 py-1.5 border border-indigo-300 rounded-md text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-black" />
              <h3 className="mt-2 text-sm font-medium text-black">No payments found</h3>
              <p className="mt-1 text-sm text-black">
                {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Your payment history will appear here'}
              </p>
            </div>
          )}
        </div>

        {/* Summary Card */}
        {filteredPayments.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <DollarSign className="mx-auto h-8 w-8 text-indigo-600 mb-2" />
                <p className="text-sm text-black">Total Amount</p>
                <p className="text-2xl font-bold text-black">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
              <div className="text-center">
                <Receipt className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                <p className="text-sm text-black">Total Payments</p>
                <p className="text-2xl font-bold text-black">
                  {filteredPayments.length}
                </p>
              </div>
              <div className="text-center">
                <Calendar className="mx-auto h-8 w-8 text-pink-600 mb-2" />
                <p className="text-sm text-black">Last Payment</p>
                <p className="text-lg font-bold text-black">
                  {filteredPayments[0]
                    ? new Date(filteredPayments[0].paymentDate).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
