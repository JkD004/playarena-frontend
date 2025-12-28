// src/app/maintenance/page.tsx
import { Hammer, HardHat, Timer } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl overflow-hidden text-center border border-gray-100">
        
        {/* Header Color Bar */}
        <div className="h-3 bg-teal-600 w-full"></div>

        <div className="p-10">
          <div className="mb-6 flex justify-center">
             <div className="h-20 w-20 bg-teal-50 rounded-full flex items-center justify-center animate-pulse">
                <HardHat className="w-10 h-10 text-teal-600" />
             </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Under Maintenance
          </h1>
          
          <p className="text-gray-500 mb-8 leading-relaxed">
            We are currently updating our platform to give you a better experience. 
            Please check back in a short while.
          </p>

          <div className="flex justify-center gap-8 border-t border-gray-100 pt-8">
            <div className="flex flex-col items-center gap-2">
                <Hammer className="w-5 h-5 text-gray-400" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Upgrading</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <Timer className="w-5 h-5 text-gray-400" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Back Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}