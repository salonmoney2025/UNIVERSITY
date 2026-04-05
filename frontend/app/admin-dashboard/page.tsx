'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy admin-dashboard route
 * Redirects to the appropriate dashboard based on user role
 * - SUPER_ADMIN → /super-admin-settings
 * - All other roles → /dashboard
 */
export default function AdminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Check user role and redirect accordingly
    // The middleware will handle the actual role checking
    // This page exists for backward compatibility
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
