// src/app/owner/venues/[id]/schedule/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Booking {
  booking_id: number;
  user_first_name: string;
  user_last_name: string;
  user_phone: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number;
}

export default function VenueSchedulePage() {
  const params = useParams();
  const venueId = params.id as string;
  const { token } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch bookings function (reused for refreshing)
  const fetchBookings = async () => {
    if (!token) return;
    // Don't set full loading on refresh to keep UI stable
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${venueId}/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
        
        // Update selected booking if it's open
        if (selectedBooking) {
             const updated = data.find((b: Booking) => b.booking_id === selectedBooking.booking_id);
             if(updated) setSelectedBooking(updated);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchBookings();
  }, [token, venueId]);

  // Handle Status Change
  const handleStatusUpdate = async (status: 'present' | 'absent' | 'canceled') => {
    if (!selectedBooking || !token) return;
    
    if (!confirm(`Mark this booking as ${status.toUpperCase()}?`)) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/owner/bookings/${selectedBooking.booking_id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        alert(`Booking marked as ${status}`);
        fetchBookings(); // Refresh data
        // Optionally close modal: setSelectedBooking(null);
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Error updating status");
    }
  };

  // Filter bookings for the selected date
  const dailyBookings = bookings.filter(b => {
    const bookingDate = new Date(b.start_time);
    return bookingDate.toDateString() === selectedDate.toDateString();
  });

  // Generate time slots (06:00 to 23:00)
  const timeSlots = Array.from({ length: 18 }, (_, i) => i + 6);

const getBookingForSlot = (hour: number) => {

  // Build the UTC-start + UTC-end for the slot
  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
  const day = String(selectedDate.getDate()).padStart(2, "0");

  const localSlot = new Date(`${year}-${month}-${day}T${hour.toString().padStart(2, "0")}:00:00`);
  const slotStartUTC = localSlot.getTime();
  const slotEndUTC = slotStartUTC + 60 * 60 * 1000;

  return dailyBookings.find(b => {
    const bookingStart = new Date(b.start_time).getTime();
    const bookingEnd = new Date(b.end_time).getTime();

    // Correct overlap logic:
    return slotStartUTC < bookingEnd && slotEndUTC > bookingStart && b.status !== "canceled";
  });
};


  // Color helper
  const getStatusBadgeColor = (status: string) => {
      switch(status) {
          case 'present': return 'bg-blue-100 text-blue-800 border-blue-300';
          case 'absent': return 'bg-red-100 text-red-800 border-red-300';
          default: return 'bg-green-100 text-green-800 border-green-300';
      }
  }

  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-black">Daily Schedule</h1>
            <Link href="/owner/dashboard" className="text-teal-600 hover:underline">Back to Dashboard</Link>
          </div>

          <div className="bg-white p-4 rounded-lg shadow mb-6 flex items-center space-x-4">
            <label className="font-semibold text-gray-700">Select Date:</label>
            <input 
              type="date" 
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="border p-2 rounded text-black"
            />
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-gray-200">
              {timeSlots.map(hour => {
                const booking = getBookingForSlot(hour);
                const timeLabel = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;

                return (
                  <div key={hour} className="flex h-16 hover:bg-gray-50 transition-colors">
                    <div className="w-24 flex-shrink-0 border-r border-gray-200 flex items-center justify-center text-sm font-medium text-gray-500">
                      {timeLabel}
                    </div>
                    <div className="flex-grow p-2">
                      {booking ? (
                        <button 
                          onClick={() => setSelectedBooking(booking)}
                          className={`w-full h-full border rounded-md flex items-center px-4 text-left transition-colors ${getStatusBadgeColor(booking.status)}`}
                        >
                          <div className="flex justify-between w-full">
                             <div>
                                <p className="font-bold text-sm">
                                {booking.user_first_name} {booking.user_last_name}
                                </p>
                                <p className="text-xs opacity-75">#{booking.booking_id}</p>
                             </div>
                             <span className="uppercase text-xs font-bold self-center">{booking.status}</span>
                          </div>
                        </button>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs italic">
                          Available
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- MANAGEMENT MODAL --- */}
          {selectedBooking && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative">
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
                >
                  &times;
                </button>
                
                <h2 className="text-2xl font-bold text-black mb-2">Manage Booking</h2>
                <div className="w-full h-1 bg-gray-200 mb-6"></div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                     <div>
                        <p className="text-xs text-gray-500 uppercase">Player</p>
                        <p className="text-xl font-bold text-teal-700">
                        {selectedBooking.user_first_name} {selectedBooking.user_last_name}
                        </p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase">Status</p>
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusBadgeColor(selectedBooking.status)}`}>
                            {selectedBooking.status}
                        </span>
                     </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Phone</p>
                    <p className="text-lg font-semibold text-black">
                      {selectedBooking.user_phone || "N/A"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                       <p className="text-xs text-gray-500 uppercase">ID</p>
                       <p className="font-mono text-black">#{selectedBooking.booking_id}</p>
                    </div>
                    <div>
                       <p className="text-xs text-gray-500 uppercase">Price</p>
                       <p className="font-mono text-green-600 font-bold">₹{selectedBooking.total_price}</p>
                    </div>
                  </div>
                  
                  {/* --- ACTION BUTTONS --- */}
                  {selectedBooking.status === 'confirmed' && (
                      <div className="pt-6 grid grid-cols-2 gap-3">
                        <button 
                        onClick={() => handleStatusUpdate('present')}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md"
                        >
                        ✅ Mark Present
                        </button>
                        <button 
                        onClick={() => handleStatusUpdate('absent')}
                        className="w-full py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 shadow-md"
                        >
                        🚫 Mark Absent
                        </button>
                      </div>
                  )}
                  
                  {(selectedBooking.status === 'present' || selectedBooking.status === 'absent') && (
                      <div className="pt-4 text-center text-gray-500 text-sm italic">
                          This booking has been processed.
                      </div>
                  )}

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}