'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentIdCardsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the correct path
    router.replace('/student-id-cards');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to Student ID Cards...</p>
      </div>
    </div>
  );
}
