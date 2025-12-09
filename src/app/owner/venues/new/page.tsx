// src/app/owner/venues/new/page.tsx
import ProtectedRoute from '@/components/ProtectedRoute';
import NewVenueForm from '@/components/NewVenueForm';
import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';

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
               <p className="text-gray-500 ml-1">
                 Fill out the details below to submit your venue for admin approval.
               </p>
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