"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function ManageTermsPage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    const fetchTerms = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/terms`);
        if (res.ok) {
          const data = await res.json();
          setContent(data.content);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchTerms();
  }, [token]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/terms`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      
      if (res.ok) {
        alert("Terms updated successfully!");
      } else {
        alert("Failed to update terms.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving terms.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-black">Manage Terms</h1>
            <Link href="/admin/dashboard" className="text-teal-600 hover:underline">
              Back to Dashboard
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edit Terms & Conditions Content
            </label>
            
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-black font-mono text-sm"
              />
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}