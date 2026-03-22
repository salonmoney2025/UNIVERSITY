'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Receipt, Users, Calendar, TrendingUp,
  LifeBuoy, CheckCircle, Clock, FileText
} from 'lucide-react';

interface StaffStats {
  todayPayments: number;
  pendingTickets: number;
  recentPayments: any[];
  recentTickets: any[];
}

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'STAFF' && user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchStaffStats();
  }, [user]);

  const fetchStaffStats = async () => {
    try {
      // Fetch payments
      const paymentsResponse = await fetch('/api/payments');
      const payments = paymentsResponse.ok ? await paymentsResponse.json() : [];

      // Fetch tickets
      const ticketsResponse = await fetch('/api/tickets');
      const tickets = ticketsResponse.ok ? await ticketsResponse.json() : [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayPayments = payments.filter((p: any) =>
        new Date(p.paymentDate) >= today
      );

      const pendingTickets = tickets.filter((t: any) => t.status === 'open' || t.status === 'pending');

      setStats({
        todayPayments: todayPayments.length,
        pendingTickets: pendingTickets.length,
        recentPayments: payments.slice(0, 5),
        recentTickets: tickets.slice(0, 5),
      });
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SL', {
      style: 'currency',
      currency: 'NSL',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-black">Loading staff dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-solid black-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Staff Dashboard</h1>
              <p className="mt-2 text-blue-100">
                Welcome back, {user?.name}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Calendar className="inline h-4 w-4 mr-2" />
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-solid black-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Today's Payments</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {stats?.todayPayments || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Receipt className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-solid black-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Pending Tickets</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {stats?.pendingTickets || 0}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <LifeBuoy className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-solid black-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Quick Actions</p>
                <p className="text-sm text-black mt-2">Access tools</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => router.push('/receipt/generate')}
            className="bg-white p-4 rounded-lg border border-solid black-200 hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-3"
          >
            <div className="bg-blue-100 p-2 rounded-lg">
              <Receipt className="h-5 w-5 text-blue-600" />
            </div>
            <span className="font-medium text-black">Generate Receipt</span>
          </button>

          <button
            onClick={() => router.push('/receipt/payment-records')}
            className="bg-white p-4 rounded-lg border border-solid black-200 hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-3"
          >
            <div className="bg-indigo-100 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="font-medium text-black">Payment Records</span>
          </button>

          <button
            onClick={() => router.push('/helpdesk/manage')}
            className="bg-white p-4 rounded-lg border border-solid black-200 hover:border-orange-300 hover:shadow-md transition-all flex items-center gap-3"
          >
            <div className="bg-orange-100 p-2 rounded-lg">
              <LifeBuoy className="h-5 w-5 text-orange-600" />
            </div>
            <span className="font-medium text-black">Manage Tickets</span>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Payments */}
          <div className="bg-white rounded-xl shadow-sm border border-solid black-200">
            <div className="px-6 py-4 border-b border-solid black-200">
              <h2 className="text-lg font-semibold text-black">Recent Payments</h2>
            </div>
            <div className="p-6 space-y-4">
              {stats?.recentPayments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between py-3 border-b border-solid black-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black">{payment.studentName}</p>
                    <p className="text-xs text-black">{payment.receiptNo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-black">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-xs text-black">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Tickets */}
          <div className="bg-white rounded-xl shadow-sm border border-solid black-200">
            <div className="px-6 py-4 border-b border-solid black-200">
              <h2 className="text-lg font-semibold text-black">Recent Tickets</h2>
            </div>
            <div className="p-6 space-y-4">
              {stats?.recentTickets.map((ticket: any) => (
                <div key={ticket.id} className="flex items-center justify-between py-3 border-b border-solid black-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black">{ticket.subject}</p>
                    <p className="text-xs text-black">{ticket.ticketNo}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    ticket.status === 'open'
                      ? 'bg-orange-100 text-orange-800'
                      : ticket.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
