"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('http://localhost:8080/api/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Success! Logged in.');
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage('Error: Could not connect to server.');
    }
  };

  const inputStyle = "w-full p-2 border border-gray-300 rounded-md text-black";
  const labelStyle = "block text-sm font-medium text-gray-700";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 pt-20">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-black">Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className={labelStyle}>Email</label>
            <input 
              type="email" 
              name="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              className={inputStyle} 
              required 
            />
          </div>
          <div>
            <label htmlFor="password" className={labelStyle}>Password</label>
            <input 
              type="password" 
              name="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              className={inputStyle} 
              required 
            />
          </div>

          {message && (
            <p className={`text-center ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}

          <button type="submit" className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold">
            Login
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-600">
          Don't have an account? <Link href="/register" className="text-teal-600 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}