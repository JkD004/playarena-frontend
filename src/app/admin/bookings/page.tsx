// src/app/admin/bookings/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { ArrowLeft, Search, Calendar, Clock, User, Filter } from 'lucide-react';

interface AdminBooking {
  booking_id: number;
  venue_id: number;
  venue_name: string;
  sport_category: string;
  user_id: number;
  user_first_name: string;
  user_last_name: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
}

type GroupedBookings = Record<string, Record<string, AdminBooking[]>>;

export default function AdminAllBookingsPage() {
  const [allBookings, setAllBookings] = useState<AdminBooking[]>([]); // Store raw data
  const [groupedBookings, setGroupedBookings] = useState<GroupedBookings>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const fetchAllBookings = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/bookings`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch bookings');

        const data: AdminBooking[] = await res.json();
        setAllBookings(data); // Save raw data for filtering
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllBookings();
  }, [token]);

  // Filter and Group Data whenever searchQuery or allBookings changes
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    
    // 1. Filter
    const filtered = allBookings.filter(b => 
      b.venue_name.toLowerCase().includes(lowerQuery) ||
      b.sport_category.toLowerCase().includes(lowerQuery) ||
      b.user_first_name.toLowerCase().includes(lowerQuery) ||
      b.user_last_name.toLowerCase().includes(lowerQuery) ||
      b.status.toLowerCase().includes(lowerQuery)
    );

    // 2. Group
    const groups = filtered.reduce((acc, booking) => {
      const category = booking.sport_category;
      const venueName = booking.venue_name;

      if (!acc[category]) {
        acc[category] = {};
      }
      if (!acc[category][venueName]) {
        acc[category][venueName] = [];
      }

      acc[category][venueName].push(booking);
      return acc;
    }, {} as GroupedBookings);

    setGroupedBookings(groups);
  }, [searchQuery, allBookings]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'canceled': return 'bg-red-100 text-red-800 border-red-200';
      case 'present': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'absent': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <Link href="/admin/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-teal-600 mb-2 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
              <p className="text-gray-500 mt-1">Monitor and track all platform reservations.</p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by user, venue, or status..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
             <div className="space-y-4">
               {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>)}
             </div>
          ) : Object.keys(groupedBookings).length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
              <p className="text-gray-500">Try adjusting your search terms or filters.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(groupedBookings).map(([category, venues]) => (
                <div key={category}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 capitalize flex items-center gap-2">
                    {category}
                  </h2>
                  
                  <div className="space-y-6">
                    {Object.entries(venues).map(([venueName, bookings]) => (
                      <div key={venueName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                          <h3 className="text-lg font-bold text-gray-800">{venueName}</h3>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-white">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Schedule</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking ID</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {bookings.map((booking) => (
                                <tr key={booking.booking_id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                                        {booking.user_first_name[0]}
                                      </div>
                                      <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">{booking.user_first_name} {booking.user_last_name}</p>
                                        <p className="text-xs text-gray-500">ID: {booking.user_id}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col text-sm text-gray-600">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(booking.start_time).toLocaleDateString()}
                                      </div>
                                      <div className="flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(booking.status)}`}>
                                      {booking.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ₹{booking.total_price.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                    #{booking.booking_id}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}