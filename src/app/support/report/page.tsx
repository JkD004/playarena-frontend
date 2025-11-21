// src/app/support/report/page.tsx
"use client";
import { useState } from 'react';

export default function ReportPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="max-w-xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-red-600 mb-6">Report an Issue</h1>
        
        {submitted ? (
          <div className="bg-gray-200 text-gray-800 p-6 rounded-lg text-center">
            <p>Your report has been submitted to our trust & safety team.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-4 border-t-4 border-red-500">
            <p className="text-sm text-gray-600 mb-4">Please provide details about the violation, bug, or issue you encountered.</p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
              <select className="w-full p-2 border rounded text-black">
                <option>Technical Bug</option>
                <option>Venue Misrepresentation</option>
                <option>User Misconduct</option>
                <option>Payment Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="w-full p-2 border rounded text-black h-32" required></textarea>
            </div>

            <button type="submit" className="w-full py-3 bg-red-600 text-white rounded-md font-bold hover:bg-red-700">
              Submit Report
            </button>
          </form>
        )}
      </div>
    </div>
  );
}