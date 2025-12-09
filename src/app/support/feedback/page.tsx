"use client";
import { useState } from 'react';

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // TODO: Call API to save feedback
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-black mb-2">We Value Your Feedback</h1>
        <p className="text-gray-600 mb-8">Help us improve SportGrid for everyone.</p>

        {submitted ? (
          <div className="bg-green-50 text-green-800 p-6 rounded-lg text-center border border-green-200">
            <h3 className="text-xl font-bold mb-2">Thank You!</h3>
            <p>Your feedback has been recorded.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">How was your experience?</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)} className={`text-4xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`}>★</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Comments</label>
              <textarea className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-teal-500 focus:border-transparent" placeholder="Tell us what you think..." required></textarea>
            </div>
            <button type="submit" className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-colors">Submit Feedback</button>
          </form>
        )}
      </div>
    </div>
  );
}