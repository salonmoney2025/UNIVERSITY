'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  DollarSign, Receipt, TrendingUp, Users, Calendar,
  Building2, CheckCircle, Clock, ArrowUpRight, Download
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface FinanceStats {
  today: {
    revenue: number;
    payments: number;
    pendingPayments: number;
  };
  thisMonth: {
    revenue: number;
    payments: number;
    growth: number;
  };
  recentPayments: any[];
  paymentsByType: any[];
  dailyRevenue: any[];
}

export default function FinanceDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');

  useEffect(() => {
    if (user?.role !== 'FINANCE' && user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchFinanceStats();
  }, [user, dateRange]);

  const fetchFinanceStats = async () => {
    try {
      // Fetch payments data
      const paymentsResponse = await fetch('/api/payments');
      if (!paymentsResponse.ok) throw new Error('Failed to fetch payments');

      const payments = await paymentsResponse.json();

      // Calculate statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayPayments = payments.filter((p: any) =>
        new Date(p.paymentDate) >= today
      );

      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthPayments = payments.filter((p: any) =>
        new Date(p.paymentDate) >= thisMonth
      );

      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      const lastMonthPayments = payments.filter((p: any) => {
        const date = new Date(p.paymentDate);
        return date >= lastMonth && date <= lastMonthEnd;
      });

      const todayRevenue = todayPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
      const monthRevenue = monthPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
      const lastMonthRevenue = lastMonthPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

      const growth = lastMonthRevenue > 0
        ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

      // Payment types distribution
      const typeGroups = payments.reduce((acc: any, p: any) => {
        acc[p.paymentType] = (acc[p.paymentType] || 0) + p.amount;
        return acc;
      }, {});

      const paymentsByType = Object.entries(typeGroups).map(([type, amount]) => ({
        type,
        amount,
        count: payments.filter((p: any) => p.paymentType === type).length
      }));

      // Daily revenue (last 7 days)
      const dailyRevenue = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayPayments = payments.filter((p: any) => {
          const pDate = new Date(p.paymentDate);
          return pDate >= date && pDate < nextDate;
        });

        dailyRevenue.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: dayPayments.reduce((sum: number, p: any) => sum + p.amount, 0),
          count: dayPayments.length
        });
      }

      setStats({
        today: {
          revenue: todayRevenue,
          payments: todayPayments.length,
          pendingPayments: todayPayments.filter((p: any) => p.status === 'pending').length,
        },
        thisMonth: {
          revenue: monthRevenue,
          payments: monthPayments.length,
          growth,
        },
        recentPayments: payments.slice(0, 10),
        paymentsByType,
        dailyRevenue,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to load finance statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SL', {
      style: 'currency',
      currency: 'NSL',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-black">Loading finance dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-solid black-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Finance Dashboard</h1>
              <p className="mt-2 text-green-100">
                Financial operations and revenue tracking
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Calendar className="inline h-4 w-4 mr-2" />
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Today's Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-solid black-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Today's Revenue</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {formatCurrency(stats?.today.revenue || 0)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-solid black-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Today's Payments</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {stats?.today.payments || 0}
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
                <p className="text-sm font-medium text-black">Monthly Revenue</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                  {formatCurrency(stats?.thisMonth.revenue || 0)}
                </p>
                <p className={`text-xs mt-1 flex items-center ${
                  (stats?.thisMonth.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {Math.abs(stats?.thisMonth.growth || 0).toFixed(1)}% vs last month
                </p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-solid black-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Pending Payments</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {stats?.today.pendingPayments || 0}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Revenue Trend */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-solid black-200">
            <h2 className="text-lg font-semibold text-black mb-4">Daily Revenue (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Types Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-solid black-200">
            <h2 className="text-lg font-semibold text-black mb-4">Revenue by Payment Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.paymentsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {stats?.paymentsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => router.push('/receipt/generate')}
            className="bg-white p-4 rounded-lg border border-solid black-200 hover:border-green-300 hover:shadow-md transition-all flex items-center gap-3"
          >
            <div className="bg-green-100 p-2 rounded-lg">
              <Receipt className="h-5 w-5 text-green-600" />
            </div>
            <span className="font-medium text-black">Generate Receipt</span>
          </button>

          <button
            onClick={() => router.push('/receipt/verify')}
            className="bg-white p-4 rounded-lg border border-solid black-200 hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-3"
          >
            <div className="bg-blue-100 p-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <span className="font-medium text-black">Verify Payment</span>
          </button>

          <button
            onClick={() => router.push('/banks/manage-banks')}
            className="bg-white p-4 rounded-lg border border-solid black-200 hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-3"
          >
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Building2 className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="font-medium text-black">Manage Banks</span>
          </button>

          <button
            onClick={() => router.push('/receipt/payment-records')}
            className="bg-white p-4 rounded-lg border border-solid black-200 hover:border-purple-300 hover:shadow-md transition-all flex items-center gap-3"
          >
            <div className="bg-purple-100 p-2 rounded-lg">
              <Download className="h-5 w-5 text-purple-600" />
            </div>
            <span className="font-medium text-black">Payment Records</span>
          </button>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-solid black-200">
          <div className="px-6 py-4 border-b border-solid black-200">
            <h2 className="text-lg font-semibold text-black">Recent Payments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-solid black-200">
              <thead className="bg-solid black-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Receipt No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-solid black-200">
                {stats?.recentPayments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-solid black-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      {payment.receiptNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-black">{payment.studentName}</div>
                      <div className="text-sm text-black">{payment.studentId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {payment.paymentType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-black">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-solid black-100 text-black'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
