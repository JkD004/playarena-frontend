// src/app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import {
  Shield, Users, TrendingUp, CheckCircle, XCircle,
  FileText, Calendar, DollarSign, Settings, RefreshCcw, MapPin
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface GlobalStats {
  total_bookings: number;
  confirmed_bookings: number;
  present_bookings: number;
  canceled_bookings: number;
  refunded_bookings: number;
  total_revenue: number;
}

interface GroupedStat {
  venue_id: number;
  venue_name: string;
  sport_category: string;
  total_bookings: number;
  total_revenue: number;
}

export default function AdminDashboardPage() {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [groupedStats, setGroupedStats] = useState<GroupedStat[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    // 1. Fetch Global Summary (God Mode)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/stats/global`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setGlobalStats(data))
      .catch(err => console.error(err));

    // 2. Fetch Grouped Data (For Graphs & Table)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/stats/grouped`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        // Sort by revenue (highest first) for the table
        const sorted = (data || []).sort((a: GroupedStat, b: GroupedStat) => b.total_revenue - a.total_revenue);
        setGroupedStats(sorted);
      })
      .catch(err => console.error(err));

  }, [token]);

  // Aggregate Data for "Revenue by Sport" Chart
  const sportData = groupedStats.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.sport_category);
    if (existing) {
      existing.revenue += curr.total_revenue;
    } else {
      acc.push({ name: curr.sport_category, revenue: curr.total_revenue });
    }
    return acc;
  }, []);

  const CHART_COLORS = ['#0d9488', '#0f766e', '#115e59', '#134e4a'];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
              <Shield className="w-8 h-8 mr-3 text-teal-600" /> Admin Command Center
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Platform-wide monitoring and controls.</p>
          </div>

          {/* 1. GOD MODE STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2 flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-bold uppercase mb-1">Total Platform Revenue</h3>
                <p className="text-4xl font-extrabold text-teal-600">₹{(globalStats?.total_revenue || 0).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-teal-50 rounded-full">
                <DollarSign className="w-8 h-8 text-teal-600" />
              </div>
            </div>

            {/* Status Cards */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <h3 className="text-gray-500 text-xs font-bold uppercase">Confirmed</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{globalStats?.confirmed_bookings || 0}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-gray-500 text-xs font-bold uppercase">Present</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{globalStats?.present_bookings || 0}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <h3 className="text-gray-500 text-xs font-bold uppercase">Canceled</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{globalStats?.canceled_bookings || 0}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCcw className="w-4 h-4 text-orange-600" />
                <h3 className="text-gray-500 text-xs font-bold uppercase">Refunded</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{globalStats?.refunded_bookings || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

            {/* 2. VENUE PERFORMANCE TABLE (Detailed List) */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-teal-600" /> Top Performing Venues
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                      <th className="p-4">Rank</th>
                      <th className="p-4">Venue Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-center">Bookings</th>
                      <th className="p-4 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {groupedStats.length === 0 ? (
                      <tr><td colSpan={5} className="p-6 text-center text-gray-500">No data available.</td></tr>
                    ) : (
                      groupedStats.map((venue, index) => (
                        <tr key={venue.venue_id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-gray-400 font-medium">#{index + 1}</td>
                          <td className="p-4 font-semibold text-gray-900">{venue.venue_name}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium uppercase">
                              {venue.sport_category}
                            </span>
                          </td>
                          <td className="p-4 text-center font-medium text-gray-700">{venue.total_bookings}</td>
                          <td className="p-4 text-right font-bold text-teal-700">₹{venue.total_revenue.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. MANAGEMENT TOOLS */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider">Management Tools</h3>

                <Link href="/admin/users" className="flex items-center p-4 mb-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-200 transition-all group">
                  <div className="p-2 bg-white rounded-md shadow-sm group-hover:bg-teal-100 transition-colors">
                    <Users className="w-5 h-5 text-blue-600 group-hover:text-teal-700" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-bold text-gray-900">Manage Users</h4>
                    <p className="text-xs text-gray-500">View and ban users</p>
                  </div>
                </Link>

                <Link href="/admin/venues/manage" className="flex items-center p-4 mb-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-200 transition-all group">
                  <div className="p-2 bg-white rounded-md shadow-sm group-hover:bg-teal-100 transition-colors">
                    <MapPin className="w-5 h-5 text-teal-600 group-hover:text-teal-700" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-bold text-gray-900">Manage Venues</h4>
                    <p className="text-xs text-gray-500">View revenue, owners & bookings</p>
                  </div>
                </Link>

                <Link href="/admin/bookings" className="flex items-center p-4 mb-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-200 transition-all group">
                  <div className="p-2 bg-white rounded-md shadow-sm group-hover:bg-teal-100 transition-colors">
                    <Calendar className="w-5 h-5 text-purple-600 group-hover:text-teal-700" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-bold text-gray-900">All Bookings</h4>
                    <p className="text-xs text-gray-500">Monitor transactions</p>
                  </div>
                </Link>

                <Link href="/admin/terms" className="flex items-center p-4 mb-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-200 transition-all group">
                  <div className="p-2 bg-white rounded-md shadow-sm group-hover:bg-teal-100 transition-colors">
                    <FileText className="w-5 h-5 text-orange-600 group-hover:text-teal-700" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-bold text-gray-900">Edit Terms</h4>
                    <p className="text-xs text-gray-500">Update policies</p>
                  </div>
                </Link>

                <Link href="/admin/venues" className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-200 transition-all group">
                  <div className="p-2 bg-white rounded-md shadow-sm group-hover:bg-teal-100 transition-colors">
                    <Settings className="w-5 h-5 text-teal-600 group-hover:text-teal-700" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-bold text-gray-900">Venue Approvals</h4>
                    <p className="text-xs text-gray-500">Approve/Reject venues</p>
                  </div>
                </Link>
              </div>

              {/* 4. REVENUE CHART */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-teal-600" /> Revenue by Sport
                </h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sportData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        cursor={{ fill: '#f3f4f6' }}
                      />
                      <Bar dataKey="revenue" radius={[4, 4, 0, 0]} barSize={30}>
                        {sportData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}