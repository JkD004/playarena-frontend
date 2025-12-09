// src/app/bookings/[id]/pay/page.tsx
"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Use a global variable for the Razorpay instance
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentPage() {
  const params = useParams();
  const bookingId = params.id;
  const router = useRouter();
  const { token } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to load the script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // 1. Load the script
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }

      // 2. Create Order on Backend
      const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payment/create-order/${bookingId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!orderRes.ok) throw new Error("Failed to create order");
      const orderData = await orderRes.json();

      // 3. Configure Options
      const options = {
        key: orderData.key_id, // Key ID from backend
        amount: orderData.amount * 100, // Amount in paise
        currency: 'INR',
        name: 'SportGrid',
        description: 'Turf Booking Transaction',
        order_id: orderData.order_id, // Order ID from backend
        handler: async function (response: any) {
          // 4. Verify Payment on Backend
          const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payment/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              booking_id: parseInt(bookingId as string),
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (verifyRes.ok) {
            alert('Payment Successful! Booking Confirmed.');
            router.push('/bookings/upcoming');
          } else {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: "Player Name", // Ideally fetch from profile
          email: "player@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#0D9488", // Teal color to match your theme
        },
      };

      // 5. Open Checkout
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      alert("Error initiating payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['player', 'owner', 'admin']}>
      <div className="min-h-screen bg-gray-100 pt-20 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Complete Payment</h1>
          <p className="text-gray-600 mb-8">
            You are about to pay for Booking <strong>#{bookingId}</strong> via Razorpay.
          </p>

          <button 
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full py-3 bg-teal-600 text-white rounded-md font-bold hover:bg-teal-700 transition-colors disabled:bg-gray-400"
          >
            {isProcessing ? 'Processing...' : 'Pay with Razorpay'}
          </button>
          
          <p className="text-xs text-gray-400 mt-4">
            Secure payments powered by Razorpay.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}