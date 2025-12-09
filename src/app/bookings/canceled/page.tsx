// src/app/bookings/canceled/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { XCircle, AlertCircle, Clock, RefreshCcw } from 'lucide-react';

// Define the shape of a Booking
interface Booking {
  id: number;
  user_id: number;
  venue_id: number;
  venue_name: string;
  sport_category: string;
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

        // 1. Filter for CANCELED OR REFUNDED bookings
        const canceledList = allBookings.filter(b => 
            ['canceled', 'refunded'].includes(b.status)
        );

        // 2. Sort by most recent first
        canceledList.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

        setBookings(canceledList);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  // Helper for Status Badge
  const getStatusBadge = (status: string) => {
    if (status === 'refunded') {
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-700 border border-orange-200">
                <RefreshCcw className="w-4 h-4 mr-2" /> Refunded
            </span>
        );
    }
    // Default to Canceled
    return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700 border border-red-200">
            <XCircle className="w-4 h-4 mr-2" /> Canceled
        </span>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['player', 'owner', 'admin']}>
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Canceled & Refunded</h1>
              <p className="text-gray-500 mt-1">History of bookings that didn't go through.</p>
            </div>
          </div>
          
          {isLoading && (
            <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>)}
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" /> {error}
            </div>
          )}

          {!isLoading && !error && (
            <div className="space-y-6">
              {bookings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No canceled bookings</h3>
                  <p className="text-gray-500 mt-1">You haven't canceled any games yet.</p>
                  <Link href="/venues" className="inline-block mt-4 text-teal-600 font-medium hover:underline">
                    Find a venue
                  </Link>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow opacity-90 hover:opacity-100">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        {/* Left: Info */}
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                               {booking.sport_category}
                             </span>
                             <span className="text-xs text-gray-400">#{booking.id}</span>
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                             {booking.venue_name}
                          </h3>
                          
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                             <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                                {new Date(booking.start_time).toLocaleDateString()} &bull; {new Date(booking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </div>
                             <div className="font-medium text-gray-900">
                                ₹{booking.total_price.toFixed(2)}
                             </div>
                          </div>
                        </div>

                        {/* Right: Status Badge */}
                        <div className="flex-shrink-0 flex items-center">
                           {getStatusBadge(booking.status)}
                        </div>
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