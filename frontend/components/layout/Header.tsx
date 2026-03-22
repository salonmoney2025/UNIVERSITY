'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import {
  Bell,
  Search,
  Moon,
  Sun,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  GraduationCap,
  Home,
} from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Toggle dark class on document
    document.documentElement.classList.toggle('dark');
  };

  const notifications = [
    {
      id: 1,
      title: 'New student enrolled',
      message: 'John Doe has been enrolled in Computer Science',
      time: '5 min ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Payment received',
      message: 'Le 50,000 payment received from STU-2024-001',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Exam scheduled',
      message: 'CS101 midterm exam scheduled for next week',
      time: '2 hours ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="h-16 bg-portal-header border-b border-gray-700 flex items-center justify-between px-4 lg:px-6">
      {/* Left section */}
      <div className="flex items-center space-x-4 flex-1">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>

        {/* EBKUST Portal Branding */}
        <div className="hidden lg:flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-portal-teal-500 flex items-center justify-center shadow-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">EBKUST Portal</h1>
            <p className="text-xs text-gray-300">University Management System</p>
          </div>
        </div>

        {/* HOME Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center space-x-2 px-4 py-2 bg-portal-teal-600 hover:bg-portal-teal-700 rounded-lg transition-colors ml-4"
          title="Go to Home"
        >
          <Home className="w-5 h-5 text-white" />
          <span className="text-white font-semibold text-sm hidden sm:inline">HOME</span>
        </button>

        {/* Advanced Search */}
        <div className="ml-8">
          <AdvancedSearch />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-gray-300" />
          ) : (
            <Moon className="w-5 h-5 text-gray-300" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors relative"
          >
            <Bell className="w-5 h-5 text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                      notification.unread ? 'bg-portal-teal-50 dark:bg-portal-teal-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {notification.time}
                        </p>
                      </div>
                      {notification.unread && (
                        <span className="w-2 h-2 bg-portal-teal-600 rounded-full mt-1"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700">
                <button className="text-sm text-portal-teal-600 dark:text-portal-teal-400 hover:text-portal-teal-700 dark:hover:text-portal-teal-300 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div className="w-8 h-8 bg-portal-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-300">
                {user?.role}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-300 hidden md:block" />
          </button>

          {/* User dropdown menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
              <div className="py-2">
                <button
                  onClick={() => router.push('/profile')}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <User className="w-4 h-4 mr-3" />
                  My Profile
                </button>
                <button
                  onClick={() => router.push('/settings')}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </button>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
