'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GenerateReceiptRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to payment records
    router.replace('/receipt/payment-records');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to Payment Records...</p>
      </div>
    </div>
  );
}
