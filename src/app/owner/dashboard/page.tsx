// src/app/owner/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import DashboardChart from '@/components/DashboardChart'; // Assuming you have this
import { CheckCircle, UserCheck, XCircle, RefreshCcw, TrendingUp } from 'lucide-react';

interface GlobalStats {
  total_bookings: number;
  confirmed_bookings: number;
  present_bookings: number;
  canceled_bookings: number;
  refunded_bookings: number;
  total_revenue: number;
}

interface Venue {
  id: number;
  name: string;
  status: string;
  sport_category: string;
  price_per_hour: number;
}

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    
    // Fetch Global Stats
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/owner/stats/global`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setStats(data))
    .catch(err => console.error(err));

    // Fetch Venues
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/mine`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setVenues(data))
    .catch(err => console.error(err));

  }, [token]);

  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']}>
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Owner Overview</h1>
            <Link href="/owner/venues/new" className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-teal-700">
              + List New Venue
            </Link>
          </div>

          {/* --- GOD MODE STATS CARDS --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                    <h3 className="text-sm font-medium text-gray-500">Net Revenue</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">₹{(stats?.total_revenue || 0).toFixed(0)}</p>
             </div>
             
             <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="text-sm font-bold text-green-700">Confirmed</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.confirmed_bookings || 0}</p>
             </div>

             <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-blue-700">Present</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.present_bookings || 0}</p>
             </div>

             <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <h3 className="text-sm font-bold text-red-700">Canceled</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.canceled_bookings || 0}</p>
             </div>

             <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                    <RefreshCcw className="w-5 h-5 text-orange-600" />
                    <h3 className="text-sm font-bold text-orange-700">Refunded</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.refunded_bookings || 0}</p>
             </div>
          </div>

          {/* Venues Grid */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Venues</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {venues.map(venue => (
               <div key={venue.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="font-bold text-lg text-gray-900">{venue.name}</h3>
                        <p className="text-sm text-gray-500">{venue.sport_category}</p>
                     </div>
                     <span className="px-2 py-1 bg-gray-100 text-xs font-bold uppercase rounded">{venue.status}</span>
                  </div>
                  <div className="flex gap-2">
                     <Link href={`/owner/venues/${venue.id}/dashboard`} className="flex-1 py-2 text-center bg-teal-50 text-teal-700 font-bold rounded-lg hover:bg-teal-100">
                        View Stats
                     </Link>
                     <Link href={`/owner/venues/${venue.id}/edit`} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                        Edit
                     </Link>
                  </div>
               </div>
            ))}
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}