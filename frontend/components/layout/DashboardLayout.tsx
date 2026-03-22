'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumbs from './Breadcrumbs';
import HelpCenter from '@/components/help/HelpCenter';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication using our cookie-based auth
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsAuthenticated(true);
        } else {
          router.push('/login');
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/login');
        setLoading(false);
      });
  }, [router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-solid black-50 dark:bg-solid black-900 flex">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Breadcrumbs */}
        <div className="bg-white dark:bg-solid black-800 border-b border-solid black-200 dark:border-solid black-700 px-4 lg:px-6 py-3">
          <Breadcrumbs />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-portal-header border-t border-solid black-700 px-4 lg:px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-black">
            <p>
              © 2026 EBKUST - Ernest Bai Koroma University of Science and Technology. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="#" className="hover:text-portal-teal-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-portal-teal-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-portal-teal-400 transition-colors">
                Support
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Help Center - Floating Button */}
      <HelpCenter />
    </div>
  );
}
