'use client';

import { useState } from 'react';
import { CheckCircle, Search, AlertCircle } from 'lucide-react';

export default function VerifyPaymentPage() {
  const [receiptNumber, setReceiptNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    // Simulated API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock verification result
    setVerificationResult({
      valid: true,
      receiptNumber: receiptNumber,
      studentName: 'John Doe',
      amount: 500.00,
      paymentDate: '2024-03-15',
      paymentType: 'Tuition Fee',
      status: 'Verified'
    });

    setIsVerifying(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Verify Payment</h1>
            <p className="text-gray-600">Verify student payment receipts</p>
          </div>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label htmlFor="receiptNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Number
              </label>
              <div className="relative">
                <input
                  id="receiptNumber"
                  type="text"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="Enter receipt number (e.g., RCT-2024-001234)"
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying || !receiptNumber}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : 'Verify Payment'}
            </button>
          </form>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div className={`rounded-xl shadow-sm border p-6 ${
            verificationResult.valid
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-4">
              {verificationResult.valid ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {verificationResult.valid ? 'Payment Verified ✓' : 'Payment Not Found'}
                </h3>

                {verificationResult.valid && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Receipt Number</p>
                      <p className="font-semibold text-gray-900">{verificationResult.receiptNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Student Name</p>
                      <p className="font-semibold text-gray-900">{verificationResult.studentName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount Paid</p>
                      <p className="font-semibold text-gray-900">${verificationResult.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Date</p>
                      <p className="font-semibold text-gray-900">{verificationResult.paymentDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Type</p>
                      <p className="font-semibold text-gray-900">{verificationResult.paymentType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        {verificationResult.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
