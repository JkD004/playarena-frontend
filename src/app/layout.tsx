// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import { AuthProvider } from '@/context/AuthContext'; // 1. Import AuthProvider
import PageTransition from '@/components/PageTransition';
import { Toaster } from 'react-hot-toast';
import { Analytics } from "@vercel/analytics/next"

import { SpeedInsights } from "@vercel/speed-insights/next"
// Font setup
const inter = Inter({ subsets: ['latin'] });

// Metadata for SEO
export const metadata: Metadata = {
  title: 'SportGrid',
  description: 'Book your sport',
};

// Root Layout Component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main>
            <PageTransition>{children}</PageTransition>
          </main>
          <Toaster position="top-center" /> {/* Add this line */}
          <Analytics />
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}
