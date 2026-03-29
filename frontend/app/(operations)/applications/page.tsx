'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  FileText,
  CheckCircle,
  FileCheck,
  BookCheck,
  FilePenLine,
  List,
  Edit,
  RefreshCw,
  FileSignature,
  Trash2,
  HandshakeIcon,
  Users,
  TrendingUp,
  Clock,
  XCircle,
  AlertCircle,
  ArrowRight,
  BarChart3,
} from 'lucide-react';

interface ApplicationModule {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: any;
  color: string;
  category: 'primary' | 'management' | 'operations';
}

const APPLICATION_MODULES: ApplicationModule[] = [
  {
    id: 'counts',
    title: 'Applicant Counts',
    description: 'View comprehensive statistics and analytics of all applications',
    href: '/applications/counts',
    icon: BarChart3,
    color: 'blue',
    category: 'primary',
  },
  {
    id: 'verify',
    title: 'Verify Applications',
    description: 'Review and verify submitted applications for completeness',
    href: '/applications/verify',
    icon: CheckCircle,
    color: 'green',
    category: 'primary',
  },
  {
    id: 'check-results',
    title: 'Check Results',
    description: 'View and manage application results and admission status',
    href: '/applications/check-results',
    icon: FileCheck,
    color: 'purple',
    category: 'primary',
  },
  {
    id: 'view-all',
    title: 'View All Applications',
    description: 'Comprehensive view of all applications with advanced filtering',
    href: '/applications',
    icon: FileText,
    color: 'indigo',
    category: 'primary',
  },
  {
    id: 'examinations',
    title: 'View Other Examinations',
    description: 'Manage and view special examinations and test results',
    href: '/applications/examinations',
    icon: BookCheck,
    color: 'orange',
    category: 'primary',
  },
  {
    id: 'edit',
    title: 'Edit Applicants Info',
    description: 'Edit and update applicant information and details',
    href: '/applications/edit',
    icon: FilePenLine,
    color: 'yellow',
    category: 'management',
  },
  {
    id: 'list',
    title: 'Online Applications List',
    description: 'Detailed list view of all online applications',
    href: '/applications/list',
    icon: List,
    color: 'teal',
    category: 'management',
  },
  {
    id: 'update-course',
    title: 'Update Course Info',
    description: 'Update course selections and program information',
    href: '/applications/update-course',
    icon: Edit,
    color: 'cyan',
    category: 'management',
  },
  {
    id: 'reset-provisional',
    title: 'Reset Provisional Letters',
    description: 'Reset and regenerate provisional admission letters',
    href: '/applications/reset-provisional',
    icon: RefreshCw,
    color: 'pink',
    category: 'operations',
  },
  {
    id: 'transfer',
    title: 'Transfer Applicants',
    description: 'Transfer applicants between programs or courses',
    href: '/applications/transfer',
    icon: RefreshCw,
    color: 'violet',
    category: 'operations',
  },
  {
    id: 'exemption',
    title: 'Applicants Exemption',
    description: 'Manage fee exemptions and special considerations',
    href: '/applications/exemption',
    icon: FileSignature,
    color: 'lime',
    category: 'operations',
  },
  {
    id: 'delete-allotment',
    title: 'Delete Allotment',
    description: 'Remove or modify course allotments for applicants',
    href: '/applications/delete-allotment',
    icon: Trash2,
    color: 'red',
    category: 'operations',
  },
  {
    id: 'accept-offer',
    title: 'Accept Offer Letter',
    description: 'Manage offer letter acceptances and confirmations',
    href: '/applications/accept-offer',
    icon: HandshakeIcon,
    color: 'emerald',
    category: 'operations',
  },
];

const STATISTICS = [
  {
    id: 1,
    label: 'Total Applications',
    value: '2,458',
    change: '+12.5%',
    trend: 'up',
    icon: FileText,
    color: 'blue',
  },
  {
    id: 2,
    label: 'Pending Verification',
    value: '342',
    change: '-8.2%',
    trend: 'down',
    icon: Clock,
    color: 'yellow',
  },
  {
    id: 3,
    label: 'Verified Applications',
    value: '1,876',
    change: '+15.3%',
    trend: 'up',
    icon: CheckCircle,
    color: 'green',
  },
  {
    id: 4,
    label: 'Rejected',
    value: '240',
    change: '+2.1%',
    trend: 'up',
    icon: XCircle,
    color: 'red',
  },
];

export default function ApplicationsPage() {
  const getColorClasses = (color: string) => {
    const colors: Record<string, any> = {
      blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', border: 'border-blue-200', hover: 'hover:bg-blue-100' },
      green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', border: 'border-green-200', hover: 'hover:bg-green-100' },
      purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', border: 'border-purple-200', hover: 'hover:bg-purple-100' },
      indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-100 text-indigo-600', border: 'border-indigo-200', hover: 'hover:bg-indigo-100' },
      orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', border: 'border-orange-200', hover: 'hover:bg-orange-100' },
      yellow: { bg: 'bg-yellow-50', icon: 'bg-yellow-100 text-yellow-600', border: 'border-yellow-200', hover: 'hover:bg-yellow-100' },
      teal: { bg: 'bg-teal-50', icon: 'bg-teal-100 text-teal-600', border: 'border-teal-200', hover: 'hover:bg-teal-100' },
      cyan: { bg: 'bg-cyan-50', icon: 'bg-cyan-100 text-cyan-600', border: 'border-cyan-200', hover: 'hover:bg-cyan-100' },
      pink: { bg: 'bg-pink-50', icon: 'bg-pink-100 text-pink-600', border: 'border-pink-200', hover: 'hover:bg-pink-100' },
      violet: { bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-600', border: 'border-violet-200', hover: 'hover:bg-violet-100' },
      lime: { bg: 'bg-lime-50', icon: 'bg-lime-100 text-lime-600', border: 'border-lime-200', hover: 'hover:bg-lime-100' },
      red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', border: 'border-red-200', hover: 'hover:bg-red-100' },
      emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-200', hover: 'hover:bg-emerald-100' },
    };
    return colors[color] || colors.blue;
  };

  const getStatColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'border-blue-500',
      yellow: 'border-yellow-500',
      green: 'border-green-500',
      red: 'border-red-500',
    };
    return colors[color] || 'border-blue-500';
  };

  const primaryModules = APPLICATION_MODULES.filter(m => m.category === 'primary');
  const managementModules = APPLICATION_MODULES.filter(m => m.category === 'management');
  const operationsModules = APPLICATION_MODULES.filter(m => m.category === 'operations');

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-black mb-4">
            <span className="text-black">Online Applications</span>
            <span className="text-black">/</span>
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              Home
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-black">
                ONLINE APPLICATIONS MANAGEMENT
              </h1>
              <p className="text-black mt-1">
                Comprehensive admission application management system
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
                  <p className={`text-sm mt-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend === 'up' ? '↑' : '↓'} {stat.change} from last month
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color).icon}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Primary Modules */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-blue-600" />
            Primary Operations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {primaryModules.map((module) => {
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

        {/* Management Modules */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
            <Edit className="w-6 h-6 text-teal-600" />
            Application Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managementModules.map((module) => {
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

        {/* Operations Modules */}
        <div>
          <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-purple-600" />
            Special Operations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {operationsModules.map((module) => {
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
      </div>
    </DashboardLayout>
  );
}
