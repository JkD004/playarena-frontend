// src/app/admin/terms/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import toast from 'react-hot-toast';


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
        toast.success("Terms updated successfully!");
      } else {
        toast.success("Failed to update terms.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message :"Error saving terms.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <Link href="/admin/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-teal-600 mb-2 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="w-8 h-8 text-teal-600" />
                Manage Terms
              </h1>
              <p className="text-gray-500 mt-1">Update the Terms & Conditions displayed to users.</p>
            </div>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Editor Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Content
              </label>
              <p className="text-xs text-gray-500">
                Tip: Press <strong>Enter</strong> to create new lines. They will appear as paragraphs on the public page.
              </p>
            </div>
            
            {isLoading ? (
              <div className="h-96 flex items-center justify-center text-gray-500">
                Loading content...
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[600px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-800 font-mono text-sm leading-relaxed resize-none"
                placeholder="Enter your terms and conditions here..."
              />
            )}
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}