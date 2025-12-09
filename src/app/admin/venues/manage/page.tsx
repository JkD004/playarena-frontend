// src/app/admin/venues/manage/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, User, MapPin } from 'lucide-react';

interface VenueItem {
  id: number;
  name: string;
  sport_category: string;
  status: string;
  owner_name: string;
}

export default function ManageVenuesPage() {
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/venues/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setVenues(data || []))
    .catch(err => console.error(err));
  }, [token]);

  // Group by Sport
  const grouped = venues.reduce((acc, venue) => {
    (acc[venue.sport_category] = acc[venue.sport_category] || []).push(venue);
    return acc;
  }, {} as Record<string, VenueItem[]>);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
             <Link href="/admin/dashboard" className="mr-4 text-gray-500 hover:text-teal-600"><ArrowLeft className="w-6 h-6"/></Link>
             <h1 className="text-3xl font-bold text-gray-900">Manage Venues</h1>
          </div>

          {Object.keys(grouped).length === 0 && <p>Loading venues...</p>}

          {Object.keys(grouped).map(sport => (
            <div key={sport} className="mb-10">
               <h2 className="text-xl font-bold text-gray-800 mb-4 px-2 border-l-4 border-teal-500 uppercase tracking-wide">{sport}</h2>
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {grouped[sport].map((venue, idx) => (
                     <div key={venue.id} className={`p-5 flex justify-between items-center hover:bg-gray-50 transition-colors ${idx !== grouped[sport].length -1 ? 'border-b border-gray-100': ''}`}>
                        <div>
                           <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold text-gray-900">{venue.name}</h3>
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${venue.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                 {venue.status}
                              </span>
                           </div>
                           <p className="text-sm text-gray-500 flex items-center mt-1">
                              <User className="w-3 h-3 mr-1" /> Owner: {venue.owner_name}
                           </p>
                        </div>
                        
                        <Link href={`/admin/venues/${venue.id}/details`} className="flex items-center text-sm font-bold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-lg transition-colors">
                           View Details <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                     </div>
                  ))}
               </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}