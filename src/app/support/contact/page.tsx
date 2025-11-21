// src/app/support/contact/page.tsx
"use client";
import { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would call an API to save the ticket
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="max-w-xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-black mb-6">Get Support</h1>
        
        {submitted ? (
          <div className="bg-green-100 text-green-800 p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
            <p>Our support team will reply to your email within 24 hours.</p>
            <button onClick={() => setSubmitted(false)} className="mt-4 text-green-700 underline">Send another</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" className="w-full p-2 border rounded text-black" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full p-2 border rounded text-black" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select className="w-full p-2 border rounded text-black">
                <option>Booking Issue</option>
                <option>Payment Failed</option>
                <option>Account Help</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea className="w-full p-2 border rounded text-black h-32" required></textarea>
            </div>
            <button type="submit" className="w-full py-3 bg-teal-600 text-white rounded-md font-bold hover:bg-teal-700">
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}