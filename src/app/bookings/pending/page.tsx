// src/app/bookings/pending/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { Clock, AlertTriangle, CreditCard, Info, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

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

export default function PendingBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    fetchBookings();
  }, [token]);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings/mine`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch your bookings');

      const allBookings: Booking[] = await res.json();

      // 1. Filter ONLY for PENDING bookings
      const pending = allBookings.filter(b => b.status === 'pending');

      // 2. Sort: Oldest first (Most urgent to pay)
      pending.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      setBookings(pending);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLE CANCEL ---
  const handleCancel = async (bookingId: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Booking canceled");
        // Remove from list immediately
        setBookings(prev => prev.filter(b => b.id !== bookingId));
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to cancel");
      }
    } catch (err) {
      toast.error("Error canceling booking");
    }
  };

  return (
    <ProtectedRoute allowedRoles={['player', 'owner', 'admin']}>
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Pending Bookings</h1>
            <p className="text-gray-500 mt-1">Complete payment to confirm your slots.</p>
          </div>

          {/* --- WARNING ALERT --- */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 font-medium">
                  Important: Slots are reserved for only <span className="font-bold">10 minutes</span>.
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  If payment is not completed within this time, the booking will be automatically canceled.
                </p>
              </div>
            </div>
          </div>
          
          {isLoading && (
            <div className="space-y-4">
               {[1,2].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>)}
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" /> {error}
            </div>
          )}

          {!isLoading && !error && (
            <div className="space-y-6">
              {bookings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-teal-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                  <p className="text-gray-500 mt-1">You have no pending payments.</p>
                  <Link href="/venues" className="inline-block mt-4 text-teal-600 font-medium hover:underline">
                    Book a new game
                  </Link>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative">
                    {/* Urgency Stripe */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400"></div>
                    
                    <div className="p-6 pl-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        {/* Left: Info */}
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-xs font-bold uppercase tracking-wider text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded animate-pulse">
                               Payment Pending
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
                             <div className="font-medium text-gray-900 text-lg">
                                ₹{booking.total_price.toFixed(2)}
                             </div>
                          </div>
                          
                          <p className="text-xs text-gray-400 mt-2">
                            Booked at: {new Date(booking.created_at).toLocaleTimeString()}
                          </p>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 items-center">
                           {/* Cancel Button */}
                           <button 
                             onClick={() => handleCancel(booking.id)}
                             className="text-gray-500 hover:text-red-600 font-medium text-sm flex items-center px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                           >
                             <XCircle className="w-4 h-4 mr-2" /> Cancel
                           </button>

                           {/* Pay Button */}
                           <Link href={`/bookings/${booking.id}/pay`}>
                             <button className="flex items-center bg-teal-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200">
                               <CreditCard className="w-5 h-5 mr-2" /> Pay Now
                             </button>
                           </Link>
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