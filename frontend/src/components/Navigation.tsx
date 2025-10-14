"use client"

import Image from "next/image"
import Link from "next/link"

export default function Navigation() {
  return (
    <nav className="sticky top-0 z-50 bg-[#07294B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="block">
              <Image
                src="/images/LOGO.png"
                alt="Academy Spaces Logo"
                width={900}
                height={900}
                className="w-auto h-8"
                priority
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#explore" className="text-[#FA7436] font-poppins hover:opacity-80">
              Explore
            </a>
            {/* Divider */}
            <div className="w-px bg-gray-500 h-6"></div>
            <a href="#history" className="text-white font-poppins hover:text-gray-200">
              History
            </a>
            {/* Divider */}
            <div className="w-px bg-gray-600 h-6"></div>
            <a href="#guide" className="text-white font-poppins hover:text-gray-200">
              Guide
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <button className="text-white font-poppins hover:text-gray-200 font-medium">Log in</button>
            <button className="bg-white font-poppins text-primary-blue px-6 py-2 rounded-lg font-semibold hover:bg-gray-100">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
