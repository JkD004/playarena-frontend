"use client";
import { useState } from 'react';

export default function ReportPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-8 border-t-4 border-red-500">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Report an Issue</h1>
        <p className="text-gray-600 mb-8">Found a bug or policy violation? Let us know.</p>

        {submitted ? (
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <p className="text-gray-800 font-medium">Thank you. Our team will review your report shortly.</p>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Issue Type</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800">
                <option>Technical Bug / Error</option>
                <option>Venue Misrepresentation</option>
                <option>User Misconduct</option>
                <option>Payment Issue</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Please provide details..." required></textarea>
            </div>
            <button type="submit" className="w-full py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors">Submit Report</button>
          </form>
        )}
      </div>
    </div>
  );
}