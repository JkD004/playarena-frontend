// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import { AuthProvider } from '@/context/AuthContext'; // 1. Import AuthProvider

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
        <AuthProvider> {/* 2. Wrap with AuthProvider */}
          <Header />
          <main>{children}</main>
        </AuthProvider> {/* 3. Close wrapper */}
      </body>
    </html>
  );
}
