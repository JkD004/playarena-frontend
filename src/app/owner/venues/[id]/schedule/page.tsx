// src/app/owner/venues/[id]/schedule/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Calendar, User, Phone, Check, X, 
  Clock, AlertCircle, ChevronRight 
} from 'lucide-react';
import ConfirmationModal from '@/components/ConfirmationModal';

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

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    confirmText: '',
    isDanger: false,
    action: async () => {},
  });

  const fetchBookings = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${venueId}/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
        
        // Refresh selected booking data if modal is open
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

  // Handle Status Update with Modal
  const openStatusModal = (status: 'present' | 'absent') => {
    if (!selectedBooking) return;

    setModalConfig({
        title: `Mark as ${status === 'present' ? 'Present' : 'Absent'}?`,
        message: `Are you sure you want to mark ${selectedBooking.user_first_name} as ${status.toUpperCase()}?`,
        confirmText: `Yes, Mark ${status === 'present' ? 'Present' : 'Absent'}`,
        isDanger: status === 'absent',
        action: async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/owner/bookings/${selectedBooking.booking_id}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ status }),
                });

                if (res.ok) {
                    toast.success(`Booking marked as ${status}`);
                    fetchBookings();
                    setModalOpen(false);
                    // Optional: Close the details modal too
                    // setSelectedBooking(null); 
                } else {
                    toast.error("Failed to update status");
                }
            } catch (err) {
                toast.error("Connection error");
            }
        }
    });
    setModalOpen(true);
  };

  // Filter bookings for date
  const dailyBookings = bookings.filter(b => {
    const bookingDate = new Date(b.start_time);
    return bookingDate.toDateString() === selectedDate.toDateString();
  });

  const timeSlots = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

  const getBookingForSlot = (hour: number) => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const localSlot = new Date(`${year}-${month}-${day}T${hour.toString().padStart(2, "0")}:00:00`);
    
    const slotStartUTC = localSlot.getTime();
    const slotEndUTC = slotStartUTC + 60 * 60 * 1000;

    return dailyBookings.find(b => {
        const bookingStart = new Date(b.start_time).getTime();
        const bookingEnd = new Date(b.end_time).getTime();
        return slotStartUTC < bookingEnd && slotEndUTC > bookingStart && b.status !== "canceled" && b.status !== "refunded" && b.status !== "refund_requested";
    });
  };

  const getStatusBadgeColor = (status: string) => {
      switch(status) {
          case 'present': return 'bg-blue-100 text-blue-800 border-blue-200';
          case 'absent': return 'bg-red-100 text-red-800 border-red-200';
          case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
          default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
  };

  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']}>
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        
        <ConfirmationModal 
            isOpen={modalOpen} 
            onClose={() => setModalOpen(false)} 
            onConfirm={modalConfig.action} 
            title={modalConfig.title} 
            message={modalConfig.message} 
            confirmText={modalConfig.confirmText}
            isDanger={modalConfig.isDanger}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <Link href={`/owner/venues/${venueId}/dashboard`} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 text-gray-500 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Daily Schedule</h1>
                    <p className="text-sm text-gray-500">Manage attendance and view slots</p>
                </div>
            </div>
            
            {/* Date Picker */}
            <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-teal-600 ml-2" />
                <input 
                  type="date" 
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="text-sm font-medium text-gray-700 outline-none cursor-pointer"
                />
            </div>
          </div>

          {/* Schedule List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-gray-100">
              {timeSlots.map(hour => {
                const booking = getBookingForSlot(hour);
                const timeLabel = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
                const isCurrentHour = new Date().getHours() === hour && new Date().toDateString() === selectedDate.toDateString();

                return (
                  <div key={hour} className={`flex min-h-[4rem] group transition-colors ${isCurrentHour ? 'bg-teal-50/30' : 'hover:bg-gray-50'}`}>
                    {/* Time Column */}
                    <div className="w-24 flex-shrink-0 border-r border-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                      {timeLabel}
                    </div>
                    
                    {/* Slot Content */}
                    <div className="flex-grow p-2">
                      {booking ? (
                        <button 
                          onClick={() => setSelectedBooking(booking)}
                          className={`w-full h-full rounded-lg border flex items-center px-4 justify-between transition-all hover:shadow-sm ${getStatusBadgeColor(booking.status)}`}
                        >
                          <div className="flex items-center gap-3">
                             <div className="bg-white/50 p-1.5 rounded-full">
                                <User className="w-4 h-4 opacity-70" />
                             </div>
                             <div className="text-left">
                                <p className="font-bold text-sm leading-tight">
                                    {booking.user_first_name} {booking.user_last_name}
                                </p>
                                <p className="text-[10px] opacity-70 uppercase tracking-wider font-semibold">#{booking.booking_id}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="text-xs font-bold uppercase tracking-wide opacity-80">{booking.status}</span>
                             <ChevronRight className="w-4 h-4 opacity-50" />
                          </div>
                        </button>
                      ) : (
                        <div className="w-full h-full flex items-center pl-4">
                           <span className="px-2 py-1 rounded text-[10px] font-bold uppercase text-gray-400 border border-dashed border-gray-300">
                              Available
                           </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- DETAILS MODAL (Custom Implementation) --- */}
          {selectedBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
                
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {/* Header */}
                <div className="px-6 py-6 bg-gray-50 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-teal-600"/> 
                        {selectedBooking.user_first_name} {selectedBooking.user_last_name}
                    </h2>
                    <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(selectedBooking.status)}`}>
                        {selectedBooking.status.toUpperCase()}
                    </span>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{selectedBooking.user_phone || "No phone provided"}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{new Date(selectedBooking.start_time).toLocaleTimeString()} - {new Date(selectedBooking.end_time).toLocaleTimeString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                       <p className="text-xs text-gray-500 uppercase font-bold">Booking ID</p>
                       <p className="font-mono text-gray-900 font-medium">#{selectedBooking.booking_id}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                       <p className="text-xs text-gray-500 uppercase font-bold">Total Price</p>
                       <p className="font-mono text-green-600 font-bold">₹{selectedBooking.total_price}</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {selectedBooking.status === 'confirmed' && (
                      <div className="pt-4 grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => openStatusModal('present')}
                            className="flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-sm"
                        >
                            <Check className="w-4 h-4" /> Mark Present
                        </button>
                        <button 
                            onClick={() => openStatusModal('absent')}
                            className="flex items-center justify-center gap-2 py-2.5 bg-white border-2 border-red-100 text-red-600 rounded-lg font-bold text-sm hover:bg-red-50 transition-all"
                        >
                            <X className="w-4 h-4" /> Mark Absent
                        </button>
                      </div>
                  )}
                  
                  {['present', 'absent'].includes(selectedBooking.status) && (
                      <div className="pt-4 flex items-center justify-center gap-2 text-gray-400 text-sm italic">
                          <Check className="w-4 h-4" /> Attendance has been recorded.
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