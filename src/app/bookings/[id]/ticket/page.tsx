// src/app/bookings/[id]/ticket/page.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, CheckCircle, MapPin, Calendar, Clock, User, Hash } from 'lucide-react';

import toast from 'react-hot-toast';

interface BookingDetail {
  id: number;
  user_id: number;           // <-- NEW
  user_first_name: string;   // <-- NEW
  user_last_name: string;    // <-- NEW
  venue_name: string;
  venue_address: string;     // <-- NEW
  sport_category: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  created_at: string;        // <-- NEW (Booking Date)
}

export default function TicketPage() {
  const params = useParams();
  const bookingId = params.id as string;
  const { token } = useAuth();
  
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;

    const fetchBooking = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings/mine`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (res.ok) {
          const allBookings: BookingDetail[] = await res.json();
          const found = allBookings.find(b => b.id === parseInt(bookingId));
          if (found) setBooking(found);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [token, bookingId]);

  const downloadPDF = async () => {
    const element = ticketRef.current;
    if (!element) return;
    setDownloading(true);

    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const canvas = await html2canvas(element, { 
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = 400; 
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        const pdf = new jsPDF('p', 'pt', [pdfWidth, pdfHeight]);
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`SportGrid-Ticket-${bookingId}.pdf`);
    } catch (error) {
        toast.error(error instanceof Error ? error.message :"Could not generate PDF.");
    } finally {
        setDownloading(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-600">Loading Ticket...</div>;
  if (!booking) return <div className="p-10 text-center text-red-500">Booking not found.</div>;

  return (
    <ProtectedRoute allowedRoles={['player', 'owner', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-24 pb-12 flex flex-col items-center justify-center px-4">
        
        {/* --- TICKET CONTAINER --- */}
        <div 
          ref={ticketRef} 
          style={{
            backgroundColor: '#ffffff',
            width: '100%',
            maxWidth: '450px',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          {/* Header */}
          <div style={{ backgroundColor: '#111827', padding: '24px', textAlign: 'center', color: '#ffffff' }}>
            <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '2px', textTransform: 'uppercase' }}>SportGrid</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.8 }}>OFFICIAL ENTRY PASS</p>
          </div>

          {/* Body */}
          <div style={{ padding: '32px' }}>
            
            {/* Status & Date of Booking */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
               <div>
                  <p style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>Booked On</p>
                  <p style={{ fontSize: '12px', color: '#374151' }}>{new Date(booking.created_at).toLocaleString()}</p>
               </div>
               <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                 {booking.status}
               </span>
            </div>

            {/* Venue Details */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>{booking.venue_name}</h2>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0' }}>{booking.sport_category} Arena</p>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                 {/* Map Pin Icon Mock */}
                 <span style={{ fontSize: '16px' }}>📍</span>
                 <p style={{ fontSize: '13px', color: '#4b5563', margin: 0, lineHeight: '1.4' }}>{booking.venue_address}</p>
              </div>
            </div>

            {/* User & Ticket Info Grid */}
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* User Name */}
                    <div>
                        <p style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold', margin: 0 }}>Player Name</p>
                        <p style={{ fontSize: '14px', color: '#111827', fontWeight: 'bold', margin: '2px 0 0 0' }}>
                            {booking.user_first_name} {booking.user_last_name}
                        </p>
                    </div>
                     {/* User ID */}
                     <div>
                        <p style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold', margin: 0 }}>Player ID</p>
                        <p style={{ fontSize: '14px', color: '#111827', fontWeight: 'bold', margin: '2px 0 0 0' }}>#{booking.user_id}</p>
                    </div>
                    {/* Ticket ID */}
                    <div>
                        <p style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold', margin: 0 }}>Ticket ID</p>
                        <p style={{ fontSize: '14px', color: '#111827', fontWeight: 'bold', margin: '2px 0 0 0' }}>#{booking.id}</p>
                    </div>
                    {/* Booking ID */}
                    <div>
                        <p style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold', margin: 0 }}>Booking ID</p>
                        <p style={{ fontSize: '14px', color: '#111827', fontWeight: 'bold', margin: '2px 0 0 0' }}>#{booking.id}</p>
                    </div>
                </div>
            </div>

            {/* Slot Details (High Visibility) */}
            <div style={{ border: '2px solid #e5e7eb', borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'center' }}>
                 <p style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold', margin: '0 0 8px 0' }}>Scheduled Slot</p>
                 <p style={{ fontSize: '18px', color: '#0f766e', fontWeight: 'bold', margin: 0 }}>
                    {new Date(booking.start_time).toLocaleDateString()}
                 </p>
                 <p style={{ fontSize: '24px', color: '#111827', fontWeight: 'bold', margin: '4px 0 0 0' }}>
                    {new Date(booking.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                 </p>
            </div>

            {/* QR Code */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <QRCodeCanvas value={`BookingID:${booking.id}`} size={100} />
              </div>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>Scan to verify entry</p>
            </div>
          </div>
        </div>

        <button 
          onClick={downloadPDF}
          disabled={downloading}
          className="mt-8 flex items-center px-8 py-3 bg-teal-600 text-white rounded-full font-bold hover:bg-teal-700 transition-all shadow-lg disabled:opacity-70"
        >
          {downloading ? 'Downloading...' : 'Download Ticket PDF'}
        </button>

      </div>
    </ProtectedRoute>
  );
}