// src/app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import PendingVenues from '@/components/admin/PendingVenues';
import Link from 'next/link';
import { Award, Activity, Target, Droplets } from 'lucide-react';

// Interface for Venue Stats
interface VenueStats {
  venue_id: number;
  venue_name: string;
  sport_category: string;
  total_bookings: number;
  total_revenue: number;
}

// Grouped Data Structure
type GroupedStats = Record<string, VenueStats[]>;

export default function AdminDashboardPage() {
  const [groupedStats, setGroupedStats] = useState<GroupedStats>({});
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/stats/by-venue`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch stats');
        
        const data: VenueStats[] = await res.json();

        // Group by sport_category
        const groups = data.reduce((acc, venue) => {
          const category = venue.sport_category;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(venue);
          return acc;
        }, {} as GroupedStats);

        setGroupedStats(groups);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  // Helper to get icon for sport
  const getSportIcon = (category: string) => {
    const lowerCat = category.toLowerCase();
    if (lowerCat.includes('football') || lowerCat.includes('turf')) return <Award className="w-6 h-6 text-teal-600" />;
    if (lowerCat.includes('swimming')) return <Droplets className="w-6 h-6 text-blue-500" />;
    if (lowerCat.includes('badminton')) return <Activity className="w-6 h-6 text-orange-500" />;
    if (lowerCat.includes('snooker')) return <Target className="w-6 h-6 text-red-500" />;
    return <Award className="w-6 h-6 text-gray-500" />;
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-100 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-gray-200 pb-6">
            <div>
                <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 mt-2">Overview of platform performance and approvals.</p>
            </div>
            
            {/* --- ACTION BUTTONS (Updated) --- */}
            <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
                 <Link 
                  href="/admin/users"
                  className="py-2.5 px-5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium shadow-sm transition-colors"
                >
                  Manage Users
                </Link>
                {/* ADDED: Edit Terms Button */}
                <Link 
                  href="/admin/terms"
                  className="py-2.5 px-5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium shadow-sm transition-colors"
                >
                  Edit Terms
                </Link>
                <Link 
                  href="/admin/bookings"
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors"
                >
                  View All Bookings
                </Link>
            </div>
            {/* -------------------------------- */}

          </div>

          {/* --- STATISTICS SECTION --- */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Revenue by Sport</h2>
            
            {isLoading ? (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse"></div>)}
               </div>
            ) : Object.keys(groupedStats).length === 0 ? (
              <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-200">
                <p className="text-gray-500">No venue data available yet.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {Object.entries(groupedStats).map(([category, venues]) => (
                  <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    
                    {/* Category Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                       {getSportIcon(category)}
                       <h3 className="text-xl font-bold text-gray-800 capitalize">{category}</h3>
                       <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full font-medium ml-auto">
                         {venues.length} Venues
                       </span>
                    </div>
                    
                    {/* Venues Grid */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {venues.map((venue) => (
                        <div key={venue.venue_id} className="bg-white border border-gray-100 rounded-lg p-5 hover:shadow-md transition-shadow">
                          <h4 className="text-lg font-bold text-gray-900 mb-4 truncate" title={venue.venue_name}>
                            {venue.venue_name}
                          </h4>
                          
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Revenue</p>
                              <p className="text-2xl font-bold text-teal-600">₹{venue.total_revenue.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Bookings</p>
                              <p className="text-lg font-medium text-gray-900">{venue.total_bookings}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* --- PENDING APPROVALS SECTION --- */}
          <div>
             <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Actions</h2>
             <PendingVenues />
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}