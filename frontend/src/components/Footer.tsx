"use client"

import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-[#F4EAE5] border-t border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Logo and Info */}
          <div className="flex items-center gap-4">
            <Image
              src="/images/LOGO_BLUE.png"
              alt="Academy Spaces Logo"
              width={800}
              height={800}
              className="w-38 h-12"
            />
            <div className="border-l-2 border-gray-400 pl-4">
              <p className="text-[#08294B] text-sm font-semibold">Campus Reservation</p>
              <p className="text-[#08294B] text-sm font-semibold">System for Telkom</p>
              <p className="text-[#08294B] text-sm font-semibold">University</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 my-8"></div>

        {/* Copyright */}
        <p className="text-gray-600 text-sm text-center font-poppins">
          © 2025 Academy Spaces - Campus Reservation System
        </p>
      </div>
    </footer>
  )
}
