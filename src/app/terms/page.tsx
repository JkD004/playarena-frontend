"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/terms`);
        if (res.ok) {
          const data = await res.json();
          setContent(data.content);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTerms();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-black mb-6">Terms & Conditions</h1>
        
        {isLoading ? (
          <p className="text-gray-500">Loading terms...</p>
        ) : (
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          {/* The Back Button */}
          <button 
            onClick={() => router.back()} 
            className="flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}