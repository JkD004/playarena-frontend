// src/app/owner/venues/new/page.tsx
import ProtectedRoute from '@/components/ProtectedRoute';
import NewVenueForm from '@/components/NewVenueForm';
import Link from 'next/link';
import { ArrowLeft, MapPin, Info } from 'lucide-react'; // <--- Added Info icon

export default function NewVenuePage() {
  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']}>
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">

          {/* Back Link */}
          <div className="mb-6">
            <Link href="/owner/dashboard" className="inline-flex items-center text-gray-500 hover:text-teal-600 font-medium transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Link>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

            {/* Header Section */}
            <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-teal-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">List a New Venue</h1>
              </div>
              <p className="text-gray-500 ml-1 mb-6">
                Fill out the details below to submit your venue for admin approval.
              </p>

              {/* 👇 NEW: CONTACT ADMIN NOTICE */}
              {/* 👇 UPDATED: CONTACT ADMIN NOTICE */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide">
                    Before you list
                  </h3>

                  <p className="text-sm text-blue-800 mt-1 leading-relaxed">
                    Please contact the administrator to verify your credentials before listing a new venue.
                    This ensures a faster approval process.
                  </p>

                  {/* Email */}
                  <p className="text-sm text-blue-800 mt-1 leading-relaxed">
                    Email us at:{" "}
                    <a
                      href="mailto:thesportgrid@gmail.com"
                      className="font-medium text-blue-700 underline hover:text-blue-900 transition"
                    >
                      thesportgrid@gmail.com
                    </a>
                  </p>

                  {/* Phone Number */}
                  <p className="text-sm text-blue-800 mt-1 leading-relaxed">
                    Call us at:{" "}
                    <a
                      href="tel:+919876543210"
                      className="font-medium text-blue-700 underline hover:text-blue-900 transition"
                    >
                      +91 6362630705
                    </a>
                  </p>
                </div>
              </div>

            </div>

            {/* Form Section */}
            <div className="p-8">
              <NewVenueForm />
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}