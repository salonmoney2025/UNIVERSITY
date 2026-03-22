'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  FileText,
  FileCheck,
  FileSignature,
  HandshakeIcon,
  Printer,
  Mail,
  Users,
  Calendar,
  ArrowRight,
  LayoutGrid,
} from 'lucide-react';

interface LetterModule {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: any;
  color: string;
  stats?: {
    label: string;
    value: string | number;
  };
}

const LETTER_MODULES: LetterModule[] = [
  {
    id: 'offer-letter',
    title: 'Print Offer Letter',
    description: 'Generate and print offer letters for admitted students',
    href: '/letters/print-offer-letter',
    icon: FileText,
    color: 'blue',
    stats: { label: 'Pending', value: '45' },
  },
  {
    id: 'admission-letter',
    title: 'Print Admission Letter',
    description: 'Generate admission confirmation letters for enrolled students',
    href: '/letters/print-admission-letter',
    icon: FileCheck,
    color: 'green',
    stats: { label: 'This Month', value: '127' },
  },
  {
    id: 'provisional-letter',
    title: 'Provisional Letter',
    description: 'Issue provisional admission letters pending document verification',
    href: '/letters/provisional-letter',
    icon: FileSignature,
    color: 'yellow',
    stats: { label: 'Active', value: '23' },
  },
  {
    id: 'acceptance-letter',
    title: 'Acceptance Letter',
    description: 'Manage offer acceptance confirmations and student responses',
    href: '/letters/acceptance-letter',
    icon: HandshakeIcon,
    color: 'purple',
    stats: { label: 'Accepted', value: '89' },
  },
  {
    id: 'deferral-letter',
    title: 'Deferral Letter',
    description: 'Process admission deferral requests and issue deferral letters',
    href: '/letters/deferral-letter',
    icon: Calendar,
    color: 'orange',
    stats: { label: 'Deferred', value: '12' },
  },
];

const RECENT_ACTIVITIES = [
  {
    id: 1,
    action: 'Offer Letter printed',
    student: 'LOVETTA MANSARAY',
    course: 'BSc Nursing',
    time: '5 minutes ago',
  },
  {
    id: 2,
    action: 'Admission Letter generated',
    student: 'MOHAMED TURAY',
    course: 'BSc Computer Science',
    time: '15 minutes ago',
  },
  {
    id: 3,
    action: 'Provisional Letter issued',
    student: 'HAWA KOROMA',
    course: 'BSc Microbiology',
    time: '1 hour ago',
  },
  {
    id: 4,
    action: 'Acceptance confirmed',
    student: 'JOSEPH BANGURA',
    course: 'MBA',
    time: '2 hours ago',
  },
];

export default function LettersPage() {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'bg-blue-100 text-blue-600',
        hover: 'hover:bg-blue-100',
        border: 'border-blue-200',
      },
      green: {
        bg: 'bg-green-50',
        icon: 'bg-green-100 text-green-600',
        hover: 'hover:bg-green-100',
        border: 'border-green-200',
      },
      yellow: {
        bg: 'bg-yellow-50',
        icon: 'bg-yellow-100 text-yellow-600',
        hover: 'hover:bg-yellow-100',
        border: 'border-yellow-200',
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'bg-purple-100 text-purple-600',
        hover: 'hover:bg-purple-100',
        border: 'border-purple-200',
      },
      orange: {
        bg: 'bg-orange-50',
        icon: 'bg-orange-100 text-orange-600',
        hover: 'hover:bg-orange-100',
        border: 'border-orange-200',
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-black mb-4">
            <span className="text-black">Letters Management</span>
            <span className="text-black">/</span>
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              Home
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-black">
                LETTERS MANAGEMENT
              </h1>
              <p className="text-black mt-1">
                Generate, manage, and print all types of student letters
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Total Letters</p>
                <p className="text-3xl font-bold text-black mt-1">296</p>
                <p className="text-sm text-green-600 mt-1">↑ 12% this month</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Printer className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">This Week</p>
                <p className="text-3xl font-bold text-black mt-1">67</p>
                <p className="text-sm text-green-600 mt-1">↑ 8% from last week</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Active Students</p>
                <p className="text-3xl font-bold text-black mt-1">1,234</p>
                <p className="text-sm text-blue-600 mt-1">Across all programs</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Letter Modules Grid */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <LayoutGrid className="w-6 h-6 text-black" />
            <h2 className="text-2xl font-bold text-black">Letter Modules</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LETTER_MODULES.map((module) => {
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

                  {module.stats && (
                    <div className="bg-white p-4 border-t-2 border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-black">
                          {module.stats.label}
                        </span>
                        <span className="text-lg font-bold text-black">
                          {module.stats.value}
                        </span>
                      </div>
                    </div>
                  )}
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
            {RECENT_ACTIVITIES.map((activity) => (
              <div
                key={activity.id}
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
                        {activity.student} - {activity.course}
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
