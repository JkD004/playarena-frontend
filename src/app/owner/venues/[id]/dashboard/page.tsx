// src/app/owner/venues/[id]/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, UserCheck, XCircle, RefreshCcw, TrendingUp, Clock, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';
import { Calendar as CalendarIcon } from 'lucide-react'; // <--- Add import
import ConfirmationModal from '@/components/ConfirmationModal';

interface OwnerStats {
  total_bookings: number;
  confirmed_bookings: number;
  present_bookings: number;
  canceled_bookings: number;
  refunded_bookings: number;
  total_revenue: number;
  popular_time: string;
}

interface VenueBooking {
  booking_id: number;
  user_id: number; // <--- NEW: User ID
  user_first_name: string;
  user_last_name: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number;
}

export default function VenueStatsDashboardPage() {
  const params = useParams();
  const venueId = params.id as string;
  const { token } = useAuth();

  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [bookings, setBookings] = useState<VenueBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Blocking States
  const [blockDate, setBlockDate] = useState('');
  const [blockStartTime, setBlockStartTime] = useState('');
  const [blockEndTime, setBlockEndTime] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);

  // 👇 NEW: Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    confirmText: '',
    isDanger: false,
    action: async () => { }, // The function to run when "Yes" is clicked
  });
  const [isActionLoading, setIsActionLoading] = useState(false);

  const refreshData = async () => {
    if (!token || !venueId) return;
    if (!stats) setIsLoading(true);

    try {
      const statsPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/owner/venues/${venueId}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const bookingsPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${venueId}/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const [statsRes, bookingsRes] = await Promise.all([statsPromise, bookingsPromise]);

      if (!statsRes.ok) throw new Error('Failed to fetch stats');
      const statsData: OwnerStats = await statsRes.json();
      setStats(statsData);

      if (!bookingsRes.ok) throw new Error('Failed to fetch bookings');
      const bookingsData: VenueBooking[] = await bookingsRes.json();
      setBookings(bookingsData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefundDecision = async (bookingId: number, decision: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${decision.toUpperCase()} this refund request?`)) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/owner/bookings/${bookingId}/refund-decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ decision })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Refund ${decision}ed successfully`);
        refreshData();
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (e) {
      toast.error("Connection error");
    }
  };


  useEffect(() => {
    refreshData();
  }, [token, venueId]);

  const handleBlockSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsBlocking(true);

    const startDateTime = new Date(`${blockDate}T${blockStartTime}:00`);
    const endDateTime = new Date(`${blockDate}T${blockEndTime}:00`);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          venue_id: parseInt(venueId),
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString()
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to block slot');
      }

      toast.success("Slot blocked successfully!");
      setBlockDate('');
      setBlockStartTime('');
      setBlockEndTime('');
      refreshData();

    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error blocking slot");
    } finally {
      setIsBlocking(false);
    }
  };

  // 👇 NEW: Generic Action Handler using Modal
  const openActionModal = (bookingId: number, type: 'cancel' | 'approve' | 'reject') => {
    let title, message, confirmText, isDanger, endpoint, body;

    if (type === 'cancel') {
      title = "Cancel & Refund?";
      message = "This will cancel the confirmed booking and initiate a refund via Razorpay. This action cannot be undone.";
      confirmText = "Yes, Refund";
      isDanger = true;
      endpoint = `/api/v1/owner/bookings/${bookingId}/status`;
      body = { status: 'cancel' };
    } else if (type === 'approve') {
      title = "Approve Refund";
      message = "Are you sure you want to approve this refund request? The money will be returned to the user.";
      confirmText = "Approve Refund";
      isDanger = false;
      endpoint = `/api/v1/owner/bookings/${bookingId}/refund-decision`;
      body = { decision: 'approve' };
    } else {
      title = "Reject Refund";
      message = "Are you sure you want to REJECT this refund? You will keep the payment.";
      confirmText = "Reject Request";
      isDanger = true;
      endpoint = `/api/v1/owner/bookings/${bookingId}/refund-decision`;
      body = { decision: 'reject' };
    }

    setModalConfig({
      title, message, confirmText, isDanger,
      action: async () => {
        setIsActionLoading(true);
        try {
          const method = type === 'cancel' ? 'PATCH' : 'POST';
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body)
          });

          const data = await res.json();
          if (res.ok) {
            toast.success("Action completed successfully");
            refreshData();
            setModalOpen(false);
          } else {
            toast.error(data.error || "Action failed");
          }
        } catch (error) {
          toast.error("Connection error");
        } finally {
          setIsActionLoading(false);
        }
      }
    });
    setModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'present': return 'bg-blue-100 text-blue-800';
      case 'canceled': return 'bg-gray-100 text-gray-800'; // Standard canceled (unpaid)
      case 'refunded': return 'bg-orange-100 text-orange-800';
      case 'refund_requested': return 'bg-yellow-100 text-yellow-800 animate-pulse'; // New
      case 'refund_rejected': return 'bg-red-100 text-red-800'; // New
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const chartData = [
    { name: 'Confirmed', value: stats?.confirmed_bookings || 0, color: '#16a34a' },
    { name: 'Present', value: stats?.present_bookings || 0, color: '#2563eb' },
    { name: 'Canceled', value: stats?.canceled_bookings || 0, color: '#dc2626' },
    { name: 'Refunded', value: stats?.refunded_bookings || 0, color: '#ea580c' },
  ];

  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']}>
      <div className="min-h-screen bg-gray-50 pt-20">

        {/* 👇 RENDER THE MODAL HERE */}
        <ConfirmationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={modalConfig.action}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.confirmText}
          isDanger={modalConfig.isDanger}
          isLoading={isActionLoading}
        />


        <div className="max-w-7xl mx-auto p-4 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link
                href="/owner/dashboard"
                className="text-teal-600 hover:text-teal-800 font-medium flex items-center mb-2"
              >
                &larr; Back to All Venues
              </Link>

              <h1 className="text-3xl font-bold text-gray-900">
                Venue Dashboard
              </h1>
            </div>

            {/* NEW BUTTON — VIEW DAILY SCHEDULE */}
            <Link
              href={`/owner/venues/${venueId}/schedule`}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg 
               font-semibold hover:bg-gray-50 hover:text-teal-600 transition-colors shadow-sm"
            >
              <CalendarIcon className="w-5 h-5" />
              View Daily Schedule
            </Link>
          </div>

          {/* --- TOP ROW: STATS CARDS --- */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Stats Cards (Same as before) */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Booking Breakdown</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-bold text-green-700 uppercase">Confirmed</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.confirmed_bookings ?? 0}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-700 uppercase">Present</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.present_bookings ?? 0}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-bold text-red-700 uppercase">Canceled</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.canceled_bookings ?? 0}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="flex items-center gap-2 mb-1">
                    <RefreshCcw className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-bold text-orange-700 uppercase">Refunded</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.refunded_bookings ?? 0}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                <span className="text-gray-500">Total All-Time Bookings:</span>
                <span className="font-bold text-gray-900">{stats?.total_bookings ?? 0}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-teal-50 rounded-full">
                  <TrendingUp className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-500">Net Revenue</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {isLoading ? '...' : `₹${(stats?.total_revenue || 0).toFixed(2)}`}
              </p>
              <p className="text-xs text-gray-400 mt-2">*Excludes canceled/refunded</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-purple-50 rounded-full">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-500">Popular Time</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {isLoading ? '...' : (stats?.popular_time || '--:--')}
              </p>
              <p className="text-xs text-gray-400 mt-2">Most booked time slot</p>
            </div>
          </div>

          {/* --- MIDDLE ROW: GRAPH --- */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center">
              <BarChart2 className="w-5 h-5 mr-2 text-teal-600" /> Booking Status Overview
            </h3>

            {stats && stats.total_bookings > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      width={80}
                      tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }}
                    />
                    <Tooltip
                      cursor={{ fill: '#f3f4f6' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 w-full flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <BarChart2 className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-gray-500 font-medium">No booking data to display yet.</p>
              </div>
            )}
          </div>

          {/* --- BLOCK SLOT SECTION --- */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Block Time Slot (Maintenance/Holiday)</h2>
            <form onSubmit={handleBlockSlot} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-auto">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date</label>
                <input
                  type="date"
                  value={blockDate}
                  onChange={e => setBlockDate(e.target.value)}
                  className="w-full border p-2 rounded text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
              </div>
              <div className="w-full md:w-auto">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Start Time</label>
                <input
                  type="time"
                  value={blockStartTime}
                  onChange={e => setBlockStartTime(e.target.value)}
                  className="w-full border p-2 rounded text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
              </div>
              <div className="w-full md:w-auto">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">End Time</label>
                <input
                  type="time"
                  value={blockEndTime}
                  onChange={e => setBlockEndTime(e.target.value)}
                  className="w-full border p-2 rounded text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isBlocking}
                className="w-full md:w-auto bg-red-600 text-white px-6 py-2.5 rounded font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isBlocking ? 'Blocking...' : 'Block Slot'}
              </button>
            </form>
          </div>

          {/* --- TABLE SECTION (With IDs) --- */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            {!isLoading && !error && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {bookings.length === 0 ? (
                  <p className="p-8 text-center text-gray-500">No bookings found for this venue.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          {/* NEW COLUMNS */}
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">UID</th>
                          {/* Existing Columns */}
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {bookings.map((booking) => (
                          <tr key={booking.booking_id} className="hover:bg-gray-50">
                            {/* Booking ID */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                              #{booking.booking_id}
                            </td>
                            {/* User ID */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                              #{booking.user_id}
                            </td>

                            {/* Customer */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {booking.user_first_name} {booking.user_last_name}
                            </td>
                            {/* Date */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(booking.start_time).toLocaleDateString()}
                            </td>
                            {/* Time */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            {/* Status */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full uppercase ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                            {/* Price */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              {booking.total_price === 0 ? <span className="text-red-500">Blocked</span> : `₹${booking.total_price.toFixed(2)}`}
                            </td>
                            {/* 2. Update the Table Row Action Column */}
                            {/* Replace the previous "Cancel" button logic with this:" */}


                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              {/* Scenario A: Owner wants to cancel a Confirmed booking manually */}
                              {booking.status === 'confirmed' && (
                                <button
                                  onClick={async () => {
                                    if (!confirm("Cancel this booking? \nSince it is 'Confirmed', this will move it to 'Refund Requested' state.")) return;
                                    // ... call cancel API ...
                                  }}
                                  className="text-red-500 hover:text-red-700 text-xs border border-red-200 px-3 py-1 rounded"
                                >
                                  Cancel
                                </button>
                              )}

                              {/* Scenario B: Handling a User's Refund Request */}
                              {booking.status === 'refund_requested' && (
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={async () => handleRefundDecision(booking.booking_id, 'approve')}
                                    className="bg-green-600 text-white text-xs px-3 py-1 rounded hover:bg-green-700 shadow-sm"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={async () => handleRefundDecision(booking.booking_id, 'reject')}
                                    className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700 shadow-sm"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}

                              {/* Status display for rejected refunds */}
                              {booking.status === 'refund_rejected' && (
                                <span className="text-xs font-bold text-red-600">No Refund</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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