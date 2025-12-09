// src/components/Header.tsx
"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  User, Bell, ChevronDown, LogOut,
  Menu, X, Shield, Briefcase, ScanLine
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ============================================================
// MOBILE MENU ACCORDION GROUP
// ============================================================
const MobileMenuGroup = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left font-medium text-gray-800"
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="pl-4 pb-4 space-y-3 flex flex-col bg-gray-50 rounded-md">
          {children}
        </div>
      )}
    </div>
  );
};

// ============================================================
// DESKTOP DROPDOWN COMPONENT
// ============================================================
const DropdownMenu = ({
  button,
  children,
  buttonClassName = "",
}: {
  button: React.ReactNode;
  children: React.ReactNode;
  buttonClassName?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeIfOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeIfOutside);
    return () => document.removeEventListener("mousedown", closeIfOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1 text-sm transition-colors ${buttonClassName}`}
      >
        {button}
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-md shadow-lg z-50">
          {children}
        </div>
      )}
    </div>
  );
};

// ============================================================
// UPDATED DROPDOWN LINK (Supports onClick)
// ============================================================
const DropdownLink = ({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <Link
    href={href}
    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
    onClick={onClick}
  >
    {children}
  </Link>
);

// ============================================================
// HEADER COMPONENT
// ============================================================
const Header = () => {
  const { isLoggedIn, logout, role } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationOpen(false);
  };

  // Close mobile menu
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node))
        setIsNotificationOpen(false);

      if (profileRef.current && !profileRef.current.contains(event.target as Node))
        setIsProfileOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full bg-black text-gray-300 h-14 flex items-center z-50">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6">

        {/* Left Section */}
        <div className="flex items-center gap-4">

          {/* Hamburger Menu */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white hover:text-teal-400 focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="text-xl font-bold text-white hover:text-gray-200 tracking-wide"
          >
            SportGrid
          </Link>
        </div>

        {/* ============================================================
            DESKTOP NAVBAR
        ============================================================ */}
        <nav className="hidden md:flex flex-grow justify-center items-center space-x-8">

          {/* SPORTS */}
          <DropdownMenu
            button={<><span>Sports</span><ChevronDown className="h-4 w-4" /></>}
            buttonClassName="hover:text-white"
          >
            <DropdownLink href="/sports/swimming-pools">Swimming Pools</DropdownLink>
            <DropdownLink href="/sports/turfs">Turfs</DropdownLink>
            <DropdownLink href="/sports/badminton">Badminton</DropdownLink>
            <DropdownLink href="/sports/snooker">Snooker</DropdownLink>
          </DropdownMenu>

          {/* BOOKINGS */}
          {isLoggedIn && (
            <DropdownMenu
              button={<><span>My Bookings</span><ChevronDown className="h-4 w-4" /></>}
              buttonClassName="hover:text-white"
            >
              <DropdownLink href="/bookings/upcoming">Upcoming Bookings</DropdownLink>
              <DropdownLink href="/bookings/pending">Pending Bookings</DropdownLink>
              <DropdownLink href="/bookings/past">Past Bookings</DropdownLink>
              <DropdownLink href="/bookings/canceled">Canceled Bookings</DropdownLink>
            </DropdownMenu>
          )}

          {/* TEAMS */}
          {/* Involved Teams (Visible to 'player' and 'admin') */}
          {isLoggedIn && (role === 'player' || role === 'admin') && (
            <DropdownMenu button={<><span>Involved Teams</span><ChevronDown className="h-4 w-4" /></>} buttonClassName="hover:text-white">
              <DropdownLink href="/teams">Existing Teams</DropdownLink>
              <DropdownLink href="/teams/new">Create a New Team</DropdownLink>

              {/* FIX: Point these to the main list page so user can choose which team */}
              <DropdownLink href="/teams">Manage Teams</DropdownLink>
              <DropdownLink href="/teams">Team Chats</DropdownLink>
            </DropdownMenu>
          )}

          {/* ABOUT */}
          <DropdownMenu
            button={<><span>About Us</span><ChevronDown className="h-4 w-4" /></>}
            buttonClassName="hover:text-white"
          >
            <DropdownLink href="/about/developers">Developers</DropdownLink>
            <DropdownLink href="/about/newsroom">Newsroom</DropdownLink>
          </DropdownMenu>

          {/* SUPPORT */}
          <DropdownMenu
            button={<><span>Support</span><ChevronDown className="h-4 w-4" /></>}
            buttonClassName="hover:text-white"
          >
            <DropdownLink href="/support/contact">Get Support</DropdownLink>
            <DropdownLink href="/support/feedback">Feedback</DropdownLink>
            <DropdownLink href="/support/report">Report</DropdownLink>
          </DropdownMenu>

          {/* OWNER */}
          {isLoggedIn && role === 'owner' && (
            <Link href="/owner/dashboard" className="hover:text-white flex items-center gap-1 text-sm">
              <Briefcase className="w-4 h-4" /> My Venues
            </Link>
          )}

          {/* ADMIN */}
          {isLoggedIn && role === 'admin' && (
            <Link href="/admin/dashboard" className="hover:text-white flex items-center gap-1 text-sm">
              <Shield className="w-4 h-4" /> Admin
            </Link>
          )}
        </nav>

        {/* ============================================================
            RIGHT ICONS
        ============================================================ */}
        <div className="flex-shrink-0 flex items-center space-x-4 sm:space-x-6">

          {/* NEW: Scanner Icon for Owners/Admins */}
          {isLoggedIn && (role === 'owner' || role === 'admin') && (
            <Link href="/owner/scan" className="hover:text-teal-400 transition-colors" aria-label="Scan Ticket">
              <ScanLine className="h-6 w-6" />
            </Link>
          )}

          {/* Notifications */}
          {isLoggedIn && (
            <div className="relative" ref={notificationRef}>
              <button onClick={toggleNotification} className="hover:text-white">
                <Bell className="h-5 w-5" />
              </button>

              {isNotificationOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50">
                  <div className="p-3 border-b">
                    <p className="text-gray-800 font-semibold text-sm">Notifications</p>
                  </div>
                  <div className="p-3 text-sm text-gray-500">No new notifications</div>
                </div>
              )}
            </div>
          )}

          {/* Profile */}
          {isLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <button onClick={toggleProfile} className="hover:text-white">
                <User className="h-5 w-5" />
              </button>

              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                  <DropdownLink href="/profile/info">Your Info</DropdownLink>
                  <DropdownLink href="/profile/edit">Edit Info</DropdownLink>
                  <DropdownLink href="/profile/payment-methods">Saved Payment Methods</DropdownLink>
                  <DropdownLink href="/profile/payments">Past Payments</DropdownLink>

                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="hover:text-white">
              <User className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>

      {/* ============================================================
          MOBILE OVERLAY MENU
      ============================================================ */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-14 left-0 w-full bg-white h-[calc(100vh-3.5rem)] overflow-y-auto p-4 shadow-xl z-40">

          <MobileMenuGroup title="Sports">
            <DropdownLink href="/sports/swimming-pools" onClick={closeMobileMenu}>Swimming Pools</DropdownLink>
            <DropdownLink href="/sports/turfs" onClick={closeMobileMenu}>Turfs</DropdownLink>
            <DropdownLink href="/sports/badminton" onClick={closeMobileMenu}>Badminton</DropdownLink>
            <DropdownLink href="/sports/snooker" onClick={closeMobileMenu}>Snooker</DropdownLink>
          </MobileMenuGroup>

          {isLoggedIn && (
            <MobileMenuGroup title="My Bookings">
              <DropdownLink href="/bookings/upcoming" onClick={closeMobileMenu}>Upcoming</DropdownLink>
              <DropdownLink href="/bookings/pending" onClick={closeMobileMenu}>Pending</DropdownLink>
              <DropdownLink href="/bookings/past" onClick={closeMobileMenu}>History</DropdownLink>
              <DropdownLink href="/bookings/canceled" onClick={closeMobileMenu}>Canceled</DropdownLink>
            </MobileMenuGroup>
          )}

          {isLoggedIn && (role === "player" || role === "admin") && (
            <MobileMenuGroup title="Involved Teams">
              <DropdownLink href="/teams" onClick={closeMobileMenu}>Existing Teams</DropdownLink>
              <DropdownLink href="/teams/new" onClick={closeMobileMenu}>Create a New Team</DropdownLink>
              <DropdownLink href="/teams" onClick={closeMobileMenu}>Manage Teams</DropdownLink>
              <DropdownLink href="/teams" onClick={closeMobileMenu}>Team Chats</DropdownLink>
            </MobileMenuGroup>
          )}

          <MobileMenuGroup title="About Us">
            <DropdownLink href="/about/developers" onClick={closeMobileMenu}>Developers</DropdownLink>
            <DropdownLink href="/about/newsroom" onClick={closeMobileMenu}>Newsroom</DropdownLink>
          </MobileMenuGroup>

          <MobileMenuGroup title="Support">
            <DropdownLink href="/support/contact" onClick={closeMobileMenu}>Get Support</DropdownLink>
            <DropdownLink href="/support/feedback" onClick={closeMobileMenu}>Feedback</DropdownLink>
            <DropdownLink href="/support/report" onClick={closeMobileMenu}>Report</DropdownLink>
          </MobileMenuGroup>

          {isLoggedIn && role === 'owner' && (
            <Link href="/owner/dashboard" onClick={closeMobileMenu} className="block py-4 font-medium text-gray-800 border-b border-gray-100">
              My Venues
            </Link>
          )}

          {isLoggedIn && role === 'admin' && (
            <Link href="/admin/dashboard" onClick={closeMobileMenu} className="block py-4 font-medium text-gray-800 border-b border-gray-100">
              Admin Panel
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
