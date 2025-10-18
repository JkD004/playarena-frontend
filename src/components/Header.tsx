"use client";
import Link from "next/link";
import { Search, User } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-black text-gray-300 h-14 flex items-center z-50">
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between px-6">
        
        {/* 1. Logo (Left) */}
        <div className="flex-1 flex justify-start">
          <Link 
            href="/" 
            className="text-xl font-semibold text-white hover:text-gray-200"
            aria-label="PlayArena Home"
          >
            PlayArena
          </Link>
        </div>

        {/* 2. Centered Navigation Links */}
        <nav className="hidden md:flex flex-1 justify-center items-center space-x-8">
          <Link href="/sports" className="text-sm hover:text-white transition-colors">
            Sports
          </Link>
          <Link href="/venues" className="text-sm hover:text-white transition-colors">
            Venues
          </Link>
          <Link href="/about" className="text-sm hover:text-white transition-colors">
            About
          </Link>
          <Link href="/bookings" className="text-sm hover:text-white transition-colors">
            My Bookings
          </Link>
        </nav>

        {/* 3. Icons + Auth Buttons (Right) */}
        <div className="flex-1 flex justify-end items-center space-x-6">
          <button className="hover:text-white transition-colors" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
          <Link href="/profile" className="hover:text-white transition-colors" aria-label="Profile">
            <User className="h-4 w-4" />
          </Link>
          <Link href="/login" className="text-sm hover:text-white transition-colors">
            Login
          </Link>
          <Link 
            href="/register" 
            className="bg-white text-black px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
