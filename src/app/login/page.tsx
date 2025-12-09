// src/app/login/page.tsx
"use client";

import { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { jwtDecode } from 'jwt-decode'; // 1. Import jwtDecode

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Fetch Token
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // 2. FIX: Decode the token to get the role
      // (Because data.user is undefined in your API response)
      const decoded: any = jwtDecode(data.token);
      
      // Pass the token and the decoded role to the context
      login(data.token, decoded.role);

      // 3. Redirect
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push('/');
      }

    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
        <p className="text-sm text-gray-500 mt-2">Sign in to access your bookings</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 text-sm flex items-start animate-pulse">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Email */}
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2 ml-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-teal-500 
              transition-all text-gray-900 bg-gray-50 focus:bg-white"
              required
              placeholder="name@example.com"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-2 ml-1">
            <label className="block text-gray-700 text-sm font-semibold">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-teal-600 hover:text-teal-800 font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-teal-500 
              transition-all text-gray-900 bg-gray-50 focus:bg-white"
              required
              placeholder="••••••••"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center 
              text-gray-400 hover:text-gray-600 transition-colors"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg 
          hover:bg-teal-700 focus:ring-4 focus:ring-teal-200 
          transition-all transform active:scale-[0.98] 
          disabled:opacity-70 disabled:cursor-not-allowed 
          shadow-lg shadow-teal-500/30"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 
                  3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600 text-sm">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-teal-600 hover:text-teal-800 font-bold hover:underline transition-colors"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4 
      bg-gradient-to-br from-gray-50 to-gray-200">
      <Suspense fallback={<div className="text-teal-600 font-bold">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}