'use client';

import Link from 'next/link';
import {
  User,
  Lock,
  Bell,
  Shield,
  Globe,
  Palette,
  Settings as SettingsIcon,
  ChevronRight,
  UserCircle,
  Camera
} from 'lucide-react';

export default function SettingsPage() {

  const settingsSections = [
    {
      id: 'profile',
      title: 'Profile Settings',
      description: 'Manage your personal information, contact details, and profile photo',
      icon: User,
      href: '/settings/profile',
      color: 'bg-blue-500',
      features: ['Personal Information', 'Contact Details', 'Profile Photo', 'Bio & About']
    },
    {
      id: 'password',
      title: 'Change Password',
      description: 'Update your password and manage security settings',
      icon: Lock,
      href: '/settings/change-password',
      color: 'bg-red-500',
      features: ['Update Password', 'Security Questions', 'Two-Factor Auth']
    },
    {
      id: 'notifications',
      title: 'Notification Preferences',
      description: 'Configure email, SMS, and in-app notification settings',
      icon: Bell,
      href: '/settings/notifications',
      color: 'bg-yellow-500',
      features: ['Email Alerts', 'SMS Notifications', 'Push Notifications']
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      description: 'Control your privacy settings and account security',
      icon: Shield,
      href: '/settings/privacy',
      color: 'bg-green-500',
      features: ['Privacy Controls', 'Data Sharing', 'Activity Log']
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the look and feel of your portal',
      icon: Palette,
      href: '/settings/appearance',
      color: 'bg-purple-500',
      features: ['Theme Selection', 'Font Size', 'Color Scheme']
    },
    {
      id: 'language',
      title: 'Language & Region',
      description: 'Set your preferred language and regional settings',
      icon: Globe,
      href: '/settings/language',
      color: 'bg-indigo-500',
      features: ['Language', 'Time Zone', 'Date Format', 'Currency (NSL)']
    }
  ];

  return (
    <div className="min-h-screen bg-solid black-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <SettingsIcon className="w-8 h-8 text-portal-teal-600" />
          <h1 className="text-3xl font-bold text-black">Settings</h1>
        </div>
        <p className="text-black">Manage your account settings and preferences</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section) => (
          <Link
            key={section.id}
            href={section.href}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            {/* Card Header with Icon */}
            <div className={`${section.color} p-6 relative`}>
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <section.icon className="w-8 h-8 text-white" />
                </div>
                <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-black mb-2 group-hover:text-portal-teal-600 transition-colors">
                {section.title}
              </h3>
              <p className="text-black text-sm mb-4">
                {section.description}
              </p>

              {/* Features List */}
              <div className="space-y-2">
                {section.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-sm text-black">
                    <div className="w-1.5 h-1.5 bg-portal-teal-600 rounded-full mr-2"></div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions Section */}
      <div className="mt-12 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-black mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/settings/profile"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-solid black-200 hover:border-portal-teal-600 hover:bg-portal-teal-50 transition-all"
          >
            <UserCircle className="w-6 h-6 text-portal-teal-600" />
            <span className="font-medium text-black">Update Profile</span>
          </Link>

          <Link
            href="/settings/change-password"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-solid black-200 hover:border-red-500 hover:bg-red-50 transition-all"
          >
            <Lock className="w-6 h-6 text-red-500" />
            <span className="font-medium text-black">Change Password</span>
          </Link>

          <Link
            href="/settings/profile"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-solid black-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <Camera className="w-6 h-6 text-blue-500" />
            <span className="font-medium text-black">Upload Photo</span>
          </Link>

          <Link
            href="/settings/notifications"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-solid black-200 hover:border-yellow-500 hover:bg-yellow-50 transition-all"
          >
            <Bell className="w-6 h-6 text-yellow-500" />
            <span className="font-medium text-black">Notifications</span>
          </Link>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-portal-teal-50 rounded-lg p-6 border-l-4 border-portal-teal-600">
        <h3 className="font-bold text-black mb-2">Need Help?</h3>
        <p className="text-black text-sm">
          If you need assistance with your settings or have questions about your account,
          please contact the IT Help Desk at <a href="mailto:support@ebkustsl.edu.sl" className="text-portal-teal-600 hover:underline">support@ebkustsl.edu.sl</a> or
          visit the <Link href="/help-desk" className="text-portal-teal-600 hover:underline">Help Desk</Link>.
        </p>
      </div>
    </div>
  );
}
