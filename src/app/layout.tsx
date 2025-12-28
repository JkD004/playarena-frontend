import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import { AuthProvider } from '@/context/AuthContext';
import PageTransition from '@/components/PageTransition';
import { Toaster } from 'react-hot-toast';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Font setup
const inter = Inter({ subsets: ['latin'] });

// Metadata for SEO
export const metadata: Metadata = {
  title: 'SportGrid',
  description: 'Book your sport',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // Maintenance Mode Flag
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>

          {/* Conditional Header */}
          {isMaintenanceMode ? (
            <header className="bg-black py-4 border-b border-gray-800 shadow-md">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
                <span className="text-2xl font-bold text-white tracking-wider">
                  SportGrid
                </span>
              </div>
            </header>
          ) : (
            <Header />
          )}

          {/* Page Content */}
          <main>
            <PageTransition>{children}</PageTransition>
          </main>

          <Toaster position="top-center" />
          <Analytics />
          <SpeedInsights />

        </AuthProvider>
      </body>
    </html>
  );
}
