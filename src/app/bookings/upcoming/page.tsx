// src/app/bookings/upcoming/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/ui/EmptyState'; // Import EmptyState
import toast from 'react-hot-toast'; // Import Toast
import Skeleton from '@/components/ui/Skeleton'; // Import Skeleton for loading state

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

export default function UpcomingBookingsPage() {
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

      const upcoming = allBookings.filter(
        b => new Date(b.start_time) > new Date() && b.status === 'confirmed'
      );

      setBookings(upcoming);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const handleCancel = async (bookingID: number) => {
    const confirmMsg =
      "Are you sure you want to cancel?\n\nNote: Cancellations made less than 24 hours before the slot may not be fully refundable.";

    if (!confirm(confirmMsg)) return;

    const toastId = toast.loading("Canceling booking...");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings/${bookingID}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel booking');
      }

      toast.success("Booking canceled successfully", { id: toastId });
      fetchBookings(); // Refresh the list

    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error', { id: toastId });
    }
  };

  return (
    <ProtectedRoute allowedRoles={['player', 'owner', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-4xl font-bold text-black mb-6">
            Upcoming Bookings
          </h1>

          {/* Loading State using Skeleton */}
          {isLoading ? (
             <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
             </div>
          ) : error ? (
             <p className="text-red-500">Error: {error}</p>
          ) : (
            <div className="space-y-4">
              
              {/* Empty State */}
              {bookings.length === 0 ? (
                <EmptyState
                  title="No Upcoming Bookings"
                  message="You haven't booked any games yet. Explore venues to get started!"
                  actionLabel="Find a Turf"
                  onAction={() => router.push('/sports/turfs')}
                />
              ) : (
                // Booking List
                bookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 transition-shadow hover:shadow-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-semibold text-black mb-2">
                          {booking.sport_category} at {booking.venue_name}
                        </h2>

                        <p className="text-gray-800">
                          <strong>Date:</strong>{" "}
                          {new Date(booking.start_time).toLocaleDateString()}
                        </p>

                        <p className="text-gray-800">
                          <strong>Time:</strong>{" "}
                          {new Date(booking.start_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} 
                          {" - "}
                          {new Date(booking.end_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>

                        <p className="text-gray-600">
                          <strong>Status:</strong>{" "}
                          <span className="capitalize font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                            {booking.status}
                          </span>
                        </p>

                        <p className="text-gray-600 mt-1">
                          <strong>Price:</strong> ₹{booking.total_price.toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="py-2 px-4 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-md font-semibold transition-colors text-sm"
                      >
                        Cancel Booking
                      </button>
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