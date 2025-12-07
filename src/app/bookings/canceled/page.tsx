// src/app/bookings/canceled/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Updated Interface
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

export default function CanceledBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings/mine`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch your bookings');

        const allBookings: Booking[] = await res.json();

        // Filter for CANCELED bookings
        const canceled = allBookings.filter(b => b.status === 'canceled');
        setBookings(canceled);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  return (
    <ProtectedRoute allowedRoles={['player', 'owner', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-4xl font-bold text-black mb-6">
            Canceled Bookings
          </h1>
          
          {isLoading && <p className="text-gray-700">Loading your bookings...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {!isLoading && !error && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <p className="text-lg text-gray-700">You have no canceled bookings.</p>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 opacity-60 hover:opacity-100 transition-opacity">
                    <div>
                      {/* --- UPDATED DISPLAY --- */}
                      <h2 className="text-2xl font-semibold text-black mb-1">
                        {booking.sport_category} at {booking.venue_name}
                      </h2>
                      {/* ----------------------- */}

                      <p className="text-gray-600">
                        {new Date(booking.start_time).toLocaleDateString()} | {new Date(booking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>

                      <div className="mt-2 flex justify-between items-center">
                        <p className="text-gray-600">
                          <strong>Status:</strong> <span className="capitalize font-medium text-red-600">{booking.status}</span>
                        </p>
                        <p className="text-xl font-bold text-gray-800">
                          ₹{booking.total_price.toFixed(2)}
                        </p>
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