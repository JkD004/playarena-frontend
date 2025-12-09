// src/app/legal/privacy-policy/page.tsx
"use client"; // 1. Add this to enable interactivity

import { useRouter } from 'next/navigation'; // 2. Import router hook
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const router = useRouter(); // 3. Initialize router

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 text-gray-700 leading-relaxed">
        
        {/* 4. Use router.back() instead of Link */}
        <button 
          onClick={() => router.back()} 
          className="inline-flex items-center text-teal-600 hover:underline mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated on Dec 9, 2025</p>

        <div className="space-y-6">
          <p>
            This privacy policy sets out how <strong>ADMIN of SportGrid</strong> uses and protects any information that you give us when you visit this website and/or agree to purchase from us.
          </p>
          <p>
            We are committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, then you can be assured that it will only be used in accordance with this privacy statement.
          </p>
          <p>
            We may change this policy from time to time by updating this page. You should check this page from time to time to ensure that you are happy with any changes.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-6">We may collect the following information:</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Name</li>
            <li>Contact information including email address</li>
            <li>Demographic information such as postcode, preferences and interests</li>
            <li>Other information relevant to customer surveys and/or offers</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-6">What we do with the information we gather</h2>
          <p>We require this information to understand your needs and provide you with a better service, and in particular for the following reasons:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Internal record keeping.</li>
            <li>We may use the information to improve our products and services.</li>
            <li>We may periodically send promotional emails about new products, special offers or other information which we think you may find interesting using the email address which you have provided.</li>
            <li>From time to time, we may also use your information to contact you for market research purposes. We may contact you by email, phone, fax or mail. We may use the information to customise the website according to your interests.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-6">Security</h2>
          <p>
            We are committed to ensuring that your information is secure. In order to prevent unauthorised access or disclosure we have put in suitable measures.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-6">How we use cookies</h2>
          <p>
            A cookie is a small file which asks permission to be placed on your computer's hard drive. Once you agree, the file is added and the cookie helps analyze web traffic or lets you know when you visit a particular site. Cookies allow web applications to respond to you as an individual. The web application can tailor its operations to your needs, likes and dislikes by gathering and remembering information about your preferences.
          </p>
          <p className="mt-2">
            We use traffic log cookies to identify which pages are being used. This helps us analyze data about webpage traffic and improve our website in order to tailor it to customer needs. We only use this information for statistical analysis purposes and then the data is removed from the system.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-6">Controlling your personal information</h2>
          <p>You may choose to restrict the collection or use of your personal information in the following ways:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Whenever you are asked to fill in a form on the website, look for the box that you can click to indicate that you do not want the information to be used by anybody for direct marketing purposes.</li>
            <li>If you have previously agreed to us using your personal information for direct marketing purposes, you may change your mind at any time by writing to or emailing us at <a href="mailto:thesportgrid@gmail.com" className="text-blue-600 hover:underline">thesportgrid@gmail.com</a>.</li>
          </ul>
          <p className="mt-4">
            We will not sell, distribute or lease your personal information to third parties unless we have your permission or are required by law to do so.
          </p>
          <p className="mt-4">
            If you believe that any information we are holding on you is incorrect or incomplete, please contact us at <strong>7349726138</strong> or <a href="mailto:thesportgrid@gmail.com" className="text-blue-600 hover:underline">thesportgrid@gmail.com</a> as soon as possible. We will promptly correct any information found to be incorrect.
          </p>
        </div>
      </div>
    </div>
  );
}