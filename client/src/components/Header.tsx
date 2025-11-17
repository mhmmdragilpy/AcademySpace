'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

interface HeaderProps {
  showNavigation?: boolean;
  user?: any;
}

export default function Header({ showNavigation = true, user }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(user || null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    }
  }, [user]);

  const handleLogout = () => {
    Cookies.remove('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    router.push('/');
  };

  const isActiveTab = (path: string) => {
    if (pathname.startsWith(path)) {
      return 'nav-tab-active';
    }
    return 'nav-tab-inactive';
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-3xl mr-2">🏛️</span>
            <span className="text-xl font-bold text-blue-800">Academy Spaces</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <>
                <span className="text-gray-700">Welcome, {currentUser.full_name}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition duration-300"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        {showNavigation && currentUser && (
          <div className="hidden md:flex space-x-8 border-t border-gray-200">
            {isAdmin ? (
              <>
                <Link
                  href="/admin/dashboard"
                  className={`nav-tab ${isActiveTab('/admin/dashboard')}`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/equipment/manage"
                  className={`nav-tab ${isActiveTab('/admin/equipment')}`}
                >
                  Equipment Management
                </Link>
                <Link
                  href="/admin/facilities/manage"
                  className={`nav-tab ${isActiveTab('/admin/facilities')}`}
                >
                  Facility Management
                </Link>
                <Link
                  href="/admin/reservations"
                  className={`nav-tab ${isActiveTab('/admin/reservations')}`}
                >
                  Reservations
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className={`nav-tab ${isActiveTab('/dashboard')}`}>
                  Explore
                </Link>
                <Link
                  href="/my-reservations"
                  className={`nav-tab ${isActiveTab('/my-reservations')}`}
                >
                  History
                </Link>
                <Link href="/guide" className={`nav-tab ${isActiveTab('/guide')}`}>
                  Guide
                </Link>
              </>
            )}
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {currentUser ? (
              <div className="space-y-3">
                <p className="text-gray-700 px-4">Welcome, {currentUser.full_name}</p>
                {isAdmin ? (
                  <>
                    <Link
                      href="/admin/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/admin/equipment/manage"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Equipment Management
                    </Link>
                    <Link
                      href="/admin/facilities/manage"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Facility Management
                    </Link>
                    <Link
                      href="/admin/reservations"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Reservations
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Explore
                    </Link>
                    <Link
                      href="/my-reservations"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      History
                    </Link>
                    <Link href="/guide" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      Guide
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link href="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Login
                </Link>
                <Link href="/register" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
