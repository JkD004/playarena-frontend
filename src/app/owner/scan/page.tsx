// src/app/owner/scan/page.tsx
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner'; 
import { CheckCircle, XCircle, User, Calendar, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface BookingDetail {
  booking_id: number;
  venue_name: string;
  sport_category: string;
  user_first_name: string;
  user_last_name: string;
  user_phone: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
}

export default function ScannerPage() {
  const { token } = useAuth();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanActive, setScanActive] = useState(true);

  // 1. Handle QR Scan
  const handleScan = async (results: IDetectedBarcode[]) => {
    if (!results || results.length === 0) return;
    
    const result = results[0].rawValue;
    if (!result || !token) return;
    
    // Format is "BookingID:123"
    const parts = result.split(':');
    if (parts.length !== 2 || parts[0] !== 'BookingID') {
        return;
    }

    const bookingId = parts[1];
    setScanActive(false); // Stop scanning while we fetch
    setError(null);
    setBooking(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/owner/bookings/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Booking not found or access denied.");
      
      const data = await res.json();
      setBooking(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    }
  };

  // 2. Handle Check-In (Mark Present)
  const handleCheckIn = async () => {
    if (!booking || !token) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/owner/bookings/${booking.booking_id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'present' }),
      });

      if (res.ok) {
        toast.success("✅ Verified! Player marked as PRESENT.");
        setBooking(prev => prev ? { ...prev, status: 'present' } : null);
      } else {
        toast.success("Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message :"Error processing check-in.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']}>
      <div className="min-h-screen bg-gray-900 pt-20 pb-12 px-4 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-white mb-6">Scan Entry Ticket</h1>

        {/* --- CAMERA SECTION --- */}
        {scanActive && !booking && (
          <div className="w-full max-w-sm aspect-square bg-black rounded-xl overflow-hidden border-2 border-teal-500 shadow-2xl relative">
             <Scanner 
                onScan={handleScan}
                onError={(error: unknown) => console.log(error)}
                scanDelay={500}
                // Removed 'audio' property as it was causing the error
                components={{ finder: false }} 
             />
             <div className="absolute inset-0 border-2 border-white/30 pointer-events-none m-8 rounded-lg"></div>
             <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black/50 py-1">
                Point camera at QR Code
             </p>
          </div>
        )}

        {/* --- ERROR MESSAGE --- */}
        {error && (
            <div className="mt-6 bg-red-100 text-red-800 p-4 rounded-lg flex items-center max-w-sm w-full">
                <XCircle className="w-6 h-6 mr-3" />
                <span>{error}</span>
                <button onClick={() => { setError(null); setScanActive(true); }} className="ml-auto text-sm underline font-bold">Try Again</button>
            </div>
        )}

        {/* --- BOOKING DETAILS CARD --- */}
        {booking && (
            <div className="mt-6 bg-white w-full max-w-sm rounded-xl shadow-xl overflow-hidden animate-fade-in-up">
                <div className={`p-4 text-center text-white ${booking.status === 'confirmed' ? 'bg-teal-600' : booking.status === 'present' ? 'bg-blue-600' : 'bg-gray-600'}`}>
                    <h2 className="text-xl font-bold uppercase tracking-wider">{booking.status}</h2>
                    <p className="text-xs opacity-80">Booking #{booking.booking_id}</p>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-gray-100 p-2 rounded-full"><User className="w-5 h-5 text-gray-600"/></div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Player</p>
                            <p className="font-bold text-lg text-gray-900">{booking.user_first_name} {booking.user_last_name}</p>
                            <p className="text-sm text-gray-600">{booking.user_phone}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                         <div className="bg-gray-100 p-2 rounded-full"><MapPin className="w-5 h-5 text-gray-600"/></div>
                         <div>
                            <p className="text-xs text-gray-500 uppercase">Venue</p>
                            <p className="font-bold text-gray-900">{booking.venue_name}</p>
                            <p className="text-sm text-gray-600">{booking.sport_category}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                            <p className="text-xs text-gray-500 uppercase flex items-center"><Calendar className="w-3 h-3 mr-1"/> Date</p>
                            <p className="font-semibold text-gray-800">{new Date(booking.start_time).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase flex items-center"><Clock className="w-3 h-3 mr-1"/> Time</p>
                            <p className="font-semibold text-gray-800">
                                {new Date(booking.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>

                    {booking.status === 'confirmed' ? (
                        <button 
                            onClick={handleCheckIn}
                            disabled={isProcessing}
                            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 shadow-lg flex items-center justify-center transition-all active:scale-95"
                        >
                            <CheckCircle className="w-6 h-6 mr-2" />
                            {isProcessing ? 'Verifying...' : 'VERIFY & CHECK-IN'}
                        </button>
                    ) : booking.status === 'present' ? (
                         <div className="w-full py-4 bg-blue-50 text-blue-700 rounded-xl font-bold text-center border border-blue-200">
                            Already Checked In
                         </div>
                    ) : (
                        <div className="w-full py-4 bg-gray-100 text-gray-500 rounded-xl font-bold text-center">
                            Invalid Status: {booking.status}
                        </div>
                    )}

                    <button onClick={() => { setBooking(null); setScanActive(true); }} className="w-full py-2 text-gray-500 text-sm hover:underline">
                        Scan Another Ticket
                    </button>
                </div>
            </div>
        )}

      </div>
    </ProtectedRoute>
  );
}