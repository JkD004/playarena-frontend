// src/app/profile/payments/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { Download, CheckCircle, Clock, XCircle, UserCheck, RefreshCcw } from 'lucide-react';

interface PaymentTransaction {
  id: number;
  venue_name: string;
  sport_category: string;
  total_price: number;
  status: string;
  created_at: string;
  start_time: string;
}

export default function PaymentHistoryPage() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings/mine`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (res.ok) {
          const data: PaymentTransaction[] = await res.json();

          // Filter to show relevant history
          // We include 'canceled' so you have a record of the attempt, 
          // but now we will label it correctly.
          const history = data.filter(b =>
            ['confirmed', 'present', 'canceled', 'refunded'].includes(b.status)
          );

          history.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          setTransactions(history);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [token]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Paid
          </span>
        );
      case 'present':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <UserCheck className="w-3 h-3 mr-1" /> Completed
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            <XCircle className="w-3 h-3 mr-1" /> Canceled
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <RefreshCcw className="w-3 h-3 mr-1" /> Refund Processed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <ProtectedRoute allowedRoles={['player', 'owner', 'admin']}>
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment History</h1>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                  <Clock className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No payment history</h3>
                <p className="mt-1 text-gray-500">You haven't made any transactions yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{tx.venue_name}</div>
                          <div className="text-xs text-gray-500">{tx.sport_category} Booking</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          ₹{tx.total_price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(tx.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {/* Only show Ticket download if confirmed/present */}
                          {(tx.status === 'confirmed' || tx.status === 'present') ? (
                            <Link href={`/bookings/${tx.id}/ticket`}>
                              <button className="text-teal-600 hover:text-teal-900 flex items-center justify-end w-full gap-1">
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Ticket</span>
                              </button>
                            </Link>
                          ) : (
                            <span className="text-gray-300 text-xs italic">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}