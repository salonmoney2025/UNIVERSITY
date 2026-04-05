'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to student password reset
    router.replace('/students/reset-password');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to Password Reset...</p>
      </div>
    </div>
  );
}
