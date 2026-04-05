'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyTicketsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the tickets page
    router.replace('/help-desk/tickets');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to your tickets...</p>
      </div>
    </div>
  );
}
