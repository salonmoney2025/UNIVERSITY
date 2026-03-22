'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  GraduationCap,
  UserPlus,
  Users,
  Home,
  TrendingUp,
  List,
  Key,
  Trash2,
  UserCog,
  UserX,
  Edit,
  ArrowRight,
  BarChart3,
  BookOpen,
  Award,
} from 'lucide-react';

interface StudentModule {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: any;
  color: string;
  category: 'primary' | 'management' | 'operations';
}

const STUDENT_MODULES: StudentModule[] = [
  {
    id: 'add',
    title: 'Add Student',
    description: 'Register new students with complete information and documentation',
    href: '/students/add',
    icon: UserPlus,
    color: 'blue',
    category: 'primary',
  },
  {
    id: 'edit',
    title: 'Edit Students Info',
    description: 'View and update existing student information and records',
    href: '/students',
    icon: Edit,
    color: 'green',
    category: 'primary',
  },
  {
    id: 'halls',
    title: 'Manage Halls',
    description: 'Manage student accommodation and hall assignments',
    href: '/students/halls',
    icon: Home,
    color: 'purple',
    category: 'management',
  },
  {
    id: 'promotions',
    title: 'Student Promotions',
    description: 'Promote students to next academic level or semester',
    href: '/students/promotions',
    icon: TrendingUp,
    color: 'orange',
    category: 'management',
  },
  {
    id: 'class-list',
    title: 'Generate Class List',
    description: 'Create and export class lists by program, level, or semester',
    href: '/students/class-list',
    icon: List,
    color: 'teal',
    category: 'management',
  },
  {
    id: 'reset-password',
    title: 'Reset Student Password',
    description: 'Reset passwords for student portal access',
    href: '/students/reset-password',
    icon: Key,
    color: 'yellow',
    category: 'operations',
  },
  {
    id: 'delete',
    title: 'Delete Students Info',
    description: 'Remove student records from the system (use with caution)',
    href: '/students/delete',
    icon: Trash2,
    color: 'red',
    category: 'operations',
  },
  {
    id: 'add-others',
    title: 'Add Other Students',
    description: 'Bulk import or add special category students',
    href: '/students/add-others',
    icon: UserCog,
    color: 'indigo',
    category: 'operations',
  },
  {
    id: 'reset-others',
    title: 'Reset Other Students',
    description: 'Batch reset operations for multiple students',
    href: '/students/reset-others',
    icon: UserX,
    color: 'pink',
    category: 'operations',
  },
];

const STATISTICS = [
  {
    id: 1,
    label: 'Total Students',
    value: '12,458',
    change: '+8.2%',
    trend: 'up',
    icon: Users,
    color: 'blue',
  },
  {
    id: 2,
    label: 'Active Students',
    value: '11,234',
    change: '+5.7%',
    trend: 'up',
    icon: GraduationCap,
    color: 'green',
  },
  {
    id: 3,
    label: 'New Enrollments',
    value: '1,456',
    change: '+12.4%',
    trend: 'up',
    icon: UserPlus,
    color: 'purple',
  },
  {
    id: 4,
    label: 'Graduates',
    value: '2,341',
    change: '+3.1%',
    trend: 'up',
    icon: Award,
    color: 'orange',
  },
];

export default function StudentsPage() {
  const getColorClasses = (color: string) => {
    const colors: Record<string, any> = {
      blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', border: 'border-blue-200', hover: 'hover:bg-blue-100' },
      green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', border: 'border-green-200', hover: 'hover:bg-green-100' },
      purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', border: 'border-purple-200', hover: 'hover:bg-purple-100' },
      orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', border: 'border-orange-200', hover: 'hover:bg-orange-100' },
      teal: { bg: 'bg-teal-50', icon: 'bg-teal-100 text-teal-600', border: 'border-teal-200', hover: 'hover:bg-teal-100' },
      yellow: { bg: 'bg-yellow-50', icon: 'bg-yellow-100 text-yellow-600', border: 'border-yellow-200', hover: 'hover:bg-yellow-100' },
      red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', border: 'border-red-200', hover: 'hover:bg-red-100' },
      indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-100 text-indigo-600', border: 'border-indigo-200', hover: 'hover:bg-indigo-100' },
      pink: { bg: 'bg-pink-50', icon: 'bg-pink-100 text-pink-600', border: 'border-pink-200', hover: 'hover:bg-pink-100' },
    };
    return colors[color] || colors.blue;
  };

  const getStatColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'border-blue-500',
      green: 'border-green-500',
      purple: 'border-purple-500',
      orange: 'border-orange-500',
    };
    return colors[color] || 'border-blue-500';
  };

  const primaryModules = STUDENT_MODULES.filter(m => m.category === 'primary');
  const managementModules = STUDENT_MODULES.filter(m => m.category === 'management');
  const operationsModules = STUDENT_MODULES.filter(m => m.category === 'operations');

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-black mb-4">
            <span className="text-black">Student Management</span>
            <span className="text-black">/</span>
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              Home
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-black">
                STUDENT MANAGEMENT SYSTEM
              </h1>
              <p className="text-black mt-1">
                Comprehensive student records and academic management
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
                    {stat.trend === 'up' ? '↑' : '↓'} {stat.change} this semester
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color).icon}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Primary Operations */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Primary Operations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Management Operations */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            Student Management
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

        {/* Special Operations */}
        <div>
          <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
            <UserCog className="w-6 h-6 text-red-600" />
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
