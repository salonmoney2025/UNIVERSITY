'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  Briefcase,
  Key,
  Calendar,
  RefreshCw,
  FileText,
  UserPlus,
  ArrowRight,
  Shield,
  Clock,
  Users,
  CheckCircle,
} from 'lucide-react';

interface BackOfficeModule {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: any;
  color: string;
}

const BACK_OFFICE_MODULES: BackOfficeModule[] = [
  {
    id: 'reset-pin',
    title: 'Reset Pin Password',
    description: 'Reset application PIN passwords for online applicants',
    href: '/back-office/reset-pin',
    icon: Key,
    color: 'blue',
  },
  {
    id: 'extend-deadline',
    title: 'Extend Pin Deadline',
    description: 'Extend PIN validity period and application deadlines',
    href: '/back-office/extend-deadline',
    icon: Calendar,
    color: 'green',
  },
  {
    id: 'transfer',
    title: 'Transfer Applicants',
    description: 'Transfer applicants between programs and admission cycles',
    href: '/back-office/transfer-applicant',
    icon: RefreshCw,
    color: 'purple',
  },
  {
    id: 'online-app',
    title: 'Online Application Management',
    description: 'Manage and monitor online application submissions',
    href: '/back-office/online-application',
    icon: FileText,
    color: 'orange',
  },
  {
    id: 'student-reg',
    title: 'Student Registration',
    description: 'Bulk student registration and enrollment processing',
    href: '/back-office/student-registration',
    icon: UserPlus,
    color: 'teal',
  },
];

const STATISTICS = [
  {
    id: 1,
    label: 'Active PINs',
    value: '2,345',
    change: '+156',
    icon: Key,
    color: 'blue',
  },
  {
    id: 2,
    label: 'Pending Registrations',
    value: '487',
    change: '+23',
    icon: Clock,
    color: 'yellow',
  },
  {
    id: 3,
    label: 'Transfers Processed',
    value: '124',
    change: '+8',
    icon: RefreshCw,
    color: 'purple',
  },
  {
    id: 4,
    label: 'Completed Today',
    value: '89',
    change: '+12',
    icon: CheckCircle,
    color: 'green',
  },
];

export default function BackOfficePage() {
  const getColorClasses = (color: string) => {
    const colors: Record<string, any> = {
      blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', border: 'border-blue-200', hover: 'hover:bg-blue-100' },
      green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', border: 'border-green-200', hover: 'hover:bg-green-100' },
      purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', border: 'border-purple-200', hover: 'hover:bg-purple-100' },
      orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', border: 'border-orange-200', hover: 'hover:bg-orange-100' },
      teal: { bg: 'bg-teal-50', icon: 'bg-teal-100 text-teal-600', border: 'border-teal-200', hover: 'hover:bg-teal-100' },
      yellow: { bg: 'bg-yellow-50', icon: 'bg-yellow-100 text-yellow-600', border: 'border-yellow-200', hover: 'hover:bg-yellow-100' },
    };
    return colors[color] || colors.blue;
  };

  const getStatColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'border-blue-500',
      yellow: 'border-yellow-500',
      purple: 'border-purple-500',
      green: 'border-green-500',
    };
    return colors[color] || 'border-blue-500';
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-black mb-4">
            <span className="text-black">Back Office</span>
            <span className="text-black">/</span>
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              Home
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-black">
                BACK OFFICE MANAGEMENT
              </h1>
              <p className="text-black mt-1">
                Administrative operations and application management
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {STATISTICS.map((stat) => (
            <div
              key={stat.id}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${getStatColor(stat.color)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">{stat.label}</p>
                  <p className="text-3xl font-bold text-black mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">
                    +{stat.change} today
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color).icon}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">Administrative Access Required</p>
            <p className="text-sm text-blue-800 mt-1">
              Back office operations require elevated permissions. All actions are logged and audited for security purposes.
            </p>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Back Office Operations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BACK_OFFICE_MODULES.map((module) => {
              const colors = getColorClasses(module.color);
              return (
                <Link
                  key={module.id}
                  href={module.href}
                  className={`bg-white rounded-lg shadow-md border-2 ${colors.border} ${colors.hover} transition-all duration-200 hover:shadow-xl hover:scale-105 overflow-hidden group`}
                >
                  <div className={`${colors.bg} p-6`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 ${colors.icon} rounded-lg`}>
                        <module.icon className="w-6 h-6" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-black group-hover:text-black transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-black mb-2">
                      {module.title}
                    </h3>
                    <p className="text-sm text-black leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-black">Recent Activity</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              { action: 'PIN Reset', user: 'Admin User', detail: 'Reset PIN for applicant APP2025001', time: '5 minutes ago' },
              { action: 'Deadline Extended', user: 'System Admin', detail: 'Extended deadline for Nursing program', time: '15 minutes ago' },
              { action: 'Applicant Transfer', user: 'Admin User', detail: 'Transferred applicant to Computer Science', time: '1 hour ago' },
              { action: 'Bulk Registration', user: 'Registrar', detail: 'Registered 45 new students', time: '2 hours ago' },
            ].map((activity, index) => (
              <div
                key={index}
                className="px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-black">
                        {activity.action}
                      </p>
                      <p className="text-sm text-black mt-1">
                        {activity.detail} • By {activity.user}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-black">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-slate-50 px-6 py-3 text-center border-t border-slate-200">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
