'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { CreditCard, Search, Download, Loader2 } from 'lucide-react';
import { generateReceiptPDF } from '@/lib/pdf-generator';

export default function PaymentRecordsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [searchTerm]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = searchTerm ? new URLSearchParams({ search: searchTerm }) : '';
      const response = await fetch(`/api/payments?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Payment Records</h1>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-6"
        />
        {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : (
          <div>
            {payments.map((p) => (
              <div key={p.id} className="p-4 mb-4 bg-white rounded-lg shadow">
                <p>{p.receiptNo} - {p.studentName} - NSL {p.amount}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
