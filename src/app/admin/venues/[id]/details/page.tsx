// src/app/admin/venues/[id]/details/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Added useRouter
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, DollarSign, 
  Calendar, CheckCircle, Trash2, AlertTriangle 
} from 'lucide-react';

interface VenueDetail {
  venue_id: number;
  name: string;
  address: string;
  sport_category: string;
  status: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
}

interface VenueStats {
  total_bookings: number;
  total_revenue: number;
}

interface Booking {
  booking_id: number;
  user_first_name: string;
  user_last_name: string;
  start_time: string;
  status: string;
  total_price: number;
}

export default function AdminVenueDetailsPage() {
  const params = useParams();
  const router = useRouter(); // For redirection
  const venueId = params.id as string;
  const { token } = useAuth();

  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [stats, setStats] = useState<VenueStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;

    // 1. Get Venue Info
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/venues/${venueId}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(setVenue);

    // 2. Get Stats
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/owner/venues/${venueId}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(setStats);

    // 3. Get Bookings
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${venueId}/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(setBookings);

  }, [token, venueId]);

  // --- DELETE HANDLER ---
  const handleDeleteVenue = async () => {
    if (!confirm("ARE YOU SURE? \nThis will remove the venue from the platform. Existing bookings and revenue history will be preserved for reports, but the venue will no longer be visible.")) {
        return;
    }

    setIsDeleting(true);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/venues/${venueId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to delete venue");

        alert("Venue deleted successfully.");
        router.push("/admin/venues/manage"); // Redirect to list
    } catch (error) {
        alert("Error deleting venue");
        console.error(error);
    } finally {
        setIsDeleting(false);
    }
  };

  if (!venue) return <div className="p-20 text-center text-gray-500">Loading Venue Data...</div>;

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            <Link href="/admin/venues/manage" className="flex items-center text-gray-500 hover:text-teal-600 font-medium transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
            </Link>

            {/* DELETE BUTTON */}
            {venue.status !== 'deleted' && (
                <button 
                    onClick={handleDeleteVenue}
                    disabled={isDeleting}
                    className="flex items-center bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50"
                >
                    <Trash2 className="w-4 h-4 mr-2" /> 
                    {isDeleting ? 'Deleting...' : 'Delete Venue'}
                </button>
            )}
          </div>

          {/* WARNING IF DELETED */}
          {venue.status === 'deleted' && (
             <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 flex items-center text-red-700">
                <AlertTriangle className="w-5 h-5 mr-3" />
                <span className="font-bold">This venue has been deleted.</span>
             </div>
          )}

          {/* HEADER CARD */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
             <div className="flex justify-between items-start">
                <div>
                   <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{venue.name}</h1>
                   <p className="text-gray-500 flex items-center"><MapPin className="w-4 h-4 mr-1"/> {venue.address}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    venue.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    venue.status === 'deleted' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                   {venue.status}
                </span>
             </div>

             <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                <div>
                   <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Owner Details</h3>
                   <div className="flex items-center gap-2 mb-1"><User className="w-4 h-4 text-gray-400"/> <span className="font-medium text-gray-900">{venue.owner_name}</span></div>
                   <div className="flex items-center gap-2 mb-1"><Mail className="w-4 h-4 text-gray-400"/> <span className="text-sm text-gray-600">{venue.owner_email}</span></div>
                   <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400"/> <span className="text-sm text-gray-600">{venue.owner_phone}</span></div>
                </div>
                <div>
                   <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Performance</h3>
                   <div className="flex items-center gap-2 mb-1"><Calendar className="w-4 h-4 text-purple-500"/> <span className="font-bold text-xl text-gray-900">{stats?.total_bookings || 0}</span> <span className="text-sm text-gray-500">Bookings</span></div>
                   <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-500"/> <span className="font-bold text-xl text-gray-900">₹{(stats?.total_revenue || 0).toLocaleString()}</span> <span className="text-sm text-gray-500">Revenue</span></div>
                </div>
                <div>
                   <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Category</h3>
                   <span className="inline-flex items-center px-3 py-1 bg-teal-50 text-teal-700 rounded-full font-bold text-sm">
                      {venue.sport_category}
                   </span>
                </div>
             </div>
          </div>

          {/* BOOKING HISTORY TABLE */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">Player Bookings</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             {bookings.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No bookings found for this venue.</div>
             ) : (
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                   <thead className="bg-gray-50">
                      <tr>
                         <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Player</th>
                         <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date & Time</th>
                         <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                         <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Amount</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {bookings.map((b) => (
                         <tr key={b.booking_id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{b.user_first_name} {b.user_last_name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                               {new Date(b.start_time).toLocaleDateString()} <span className="text-gray-300">|</span> {new Date(b.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                            </td>
                            <td className="px-6 py-4">
                               <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase 
                                  ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                                    b.status === 'present' ? 'bg-blue-100 text-blue-700' :
                                    b.status === 'canceled' ? 'bg-red-100 text-red-700' : 
                                    b.status === 'refunded' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                                  {b.status}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">₹{b.total_price.toFixed(2)}</td>
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