// src/app/bookings/pending/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

// 1. Updated Interface to match Backend
interface Booking {
  id: number;
  user_id: number;
  venue_id: number;
  venue_name: string;      // <-- NEW
  sport_category: string;  // <-- NEW
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  created_at: string;
}

export default function PendingBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const router = useRouter();

  const fetchBookings = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings/mine`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch your bookings');
      
      const allBookings: Booking[] = await res.json();
      
      // Filter for PENDING bookings
      const pending = allBookings.filter(b => b.status === 'pending');
      setBookings(pending);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const handleCancel = async (bookingID: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings/${bookingID}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to cancel');
      }

      alert('Booking canceled.');
      fetchBookings(); // Refresh list

    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handlePayNow = (bookingID: number) => {
    // Redirect to the payment page for this specific booking
    router.push(`/bookings/${bookingID}/pay`);
  };

  return (
    <ProtectedRoute allowedRoles={['player', 'owner', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-4xl font-bold text-black mb-6">
            Pending Bookings
          </h1>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-700">
              These slots are reserved for you but not yet confirmed. Please complete payment to secure them.
            </p>
          </div>

          {isLoading && <p className="text-gray-700">Loading...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {!isLoading && !error && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <p className="text-lg text-gray-700">You have no pending bookings.</p>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div className="mb-4 md:mb-0">
                        
                        {/* --- 2. UPDATED DISPLAY --- */}
                        <h2 className="text-2xl font-semibold text-black mb-1">
                          {booking.sport_category} at {booking.venue_name}
                        </h2>
                        {/* ------------------------- */}
                        
                        <p className="text-gray-600">
                           {new Date(booking.start_time).toLocaleDateString()} | {new Date(booking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <p className="text-gray-800 font-bold mt-2">
                          Total: ₹{booking.total_price.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-semibold hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handlePayNow(booking.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-colors shadow-sm"
                        >
                          Complete Payment
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}