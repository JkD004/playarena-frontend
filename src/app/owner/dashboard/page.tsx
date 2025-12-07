"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import DashboardChart from '@/components/DashboardChart';
import { Award, Activity, Target, Droplets, MapPin } from 'lucide-react';

// Interface for the Venue
interface Venue {
  id: number;
  status: string;
  name: string;
  sport_category: string;
  price_per_hour: number;
  address?: string; // Optional if not always fetched
}

// Interface for Chart Data
interface VenueStats {
  venue_name: string;
  total_bookings: number;
  total_revenue: number;
}

export default function OwnerDashboardPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // 1. Fetch Venue List
  useEffect(() => {
    if (!token) return;
    const fetchMyVenues = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/mine`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch venues');
        const data: Venue[] = await res.json();
        setVenues(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyVenues();
  }, [token]);

  // 2. Fetch Chart Data (Real Stats)
  useEffect(() => {
    if (!token) return;
    const fetchChartData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/owner/stats/by-venue`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data: VenueStats[] = await res.json();
        
        // Transform for Chart
        const formattedData = data.map(item => ({
          name: item.venue_name,
          bookings: item.total_bookings,
          revenue: item.total_revenue
        }));
        
        setChartData(formattedData);
      } catch (err) {
        console.error("Error loading chart data:", err);
      }
    };
    fetchChartData();
  }, [token]);

  // Helper for Status Colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Helper for Sport Icons
  const getSportIcon = (category: string) => {
    const lowerCat = category.toLowerCase();
    if (lowerCat.includes('football') || lowerCat.includes('turf')) return <Award className="w-5 h-5 text-teal-600" />;
    if (lowerCat.includes('swimming')) return <Droplets className="w-5 h-5 text-blue-500" />;
    if (lowerCat.includes('badminton')) return <Activity className="w-5 h-5 text-orange-500" />;
    if (lowerCat.includes('snooker')) return <Target className="w-5 h-5 text-red-500" />;
    return <Award className="w-5 h-5 text-gray-500" />;
  };

  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']}>
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
                <p className="text-gray-500 mt-1">Manage your venues and track performance.</p>
            </div>
            <Link 
              href="/owner/venues/new" 
              className="py-2.5 px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-sm transition-colors flex items-center gap-2"
            >
              <span>+</span> List New Venue
            </Link>
          </div>
          
          {/* --- Chart Section --- */}
          <div className="mb-10">
             <DashboardChart data={chartData} />
          </div>

          {/* --- Venues List Section --- */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Venues</h2>

            {isLoading && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>)}
               </div>
            )}
            
            {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}
            
            {!isLoading && !error && (
              <div>
                {venues.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-lg text-gray-600 mb-4">You have not listed any venues yet.</p>
                    <Link href="/owner/venues/new" className="text-teal-600 font-medium hover:underline">Get started by listing your first venue</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {venues.map((venue) => (
                      <div key={venue.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                        
                        {/* Card Body */}
                        <div className="p-6 flex-grow">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    {getSportIcon(venue.sport_category)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 line-clamp-1" title={venue.name}>{venue.name}</h3>
                                    <p className="text-xs text-gray-500">{venue.sport_category}</p>
                                </div>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(venue.status)} uppercase tracking-wide`}>
                              {venue.status}
                            </span>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                              <span className="text-sm text-gray-500">Rate</span>
                              <span className="text-lg font-bold text-gray-900">₹{venue.price_per_hour}<span className="text-xs font-normal text-gray-500">/hr</span></span>
                          </div>
                        </div>
                        
                        {/* Card Actions */}
                        <div className="bg-gray-50 px-5 py-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                          <Link 
                            href={`/owner/venues/${venue.id}/dashboard`} 
                            className="flex items-center justify-center py-2 px-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-teal-600 rounded-lg text-sm font-medium transition-colors shadow-sm"
                          >
                            Stats
                          </Link>
                          <Link 
                            href={`/owner/venues/${venue.id}/edit`} 
                            className="flex items-center justify-center py-2 px-3 bg-teal-600 text-white hover:bg-teal-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                          >
                            Edit
                          </Link>
                          <Link 
                            href={`/owner/venues/${venue.id}/schedule`} 
                            className="w-full py-2 px-2 text-center bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium"
                          >
                            View Schedule
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}