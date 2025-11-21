// src/app/support/feedback/page.tsx
"use client";
import { useState } from 'react';

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="max-w-xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-black mb-6">Give Feedback</h1>

        {submitted ? (
          <div className="bg-blue-100 text-blue-800 p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2">Thank You!</h3>
            <p>We appreciate your feedback. It helps us make SportGrid better.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">How would you rate your experience?</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-3xl focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What can we improve?</label>
              <textarea className="w-full p-2 border rounded text-black h-32" placeholder="Tell us your thoughts..." required></textarea>
            </div>
            
            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700">
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}