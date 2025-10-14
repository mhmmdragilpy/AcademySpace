"use client"

import Image from "next/image"

export default function HeroSection() {
  const categories = ["Classrooms", "Sports", "Pools", "Auditoriums", "Laboratories"]

  return (
    <section className="relative w-full overflow-hidden -mt-1">
      {/* Background Image with overlay */}
      <div className="relative w-full h-screen">
        <Image src="/images/Hero.png" alt="Building Hero Image" fill className="object-cover object-right" priority />

        {/* Content */}
        <div className="absolute inset-0 flex items-center pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="w-full md:w-1/2">
              {/* Heading */}
              <div className="mb-6">
                <h1 className="text-4xl md:text-5xl font-poppins text-white mb-2">
                  <span className="text-[#FA7436]">Booking</span> a spot is now
                </h1>
                <h1 className="text-4xl md:text-5xl font-poppins text-white">much easier</h1>
              </div>

              {/* Subtitle */}
              <p className="text-white font-poppins text-base md:text-lg mb-6 opacity-90">
                Find and reserve a spot in campus for your necessities
              </p>

              {/* Search Bar */}
              <div className="mb-6 max-w-sm">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Campus Facilities"
                    className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange font-poppins"
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    className="font-poppins px-4 py-2 border-2 border-white text-white rounded-full hover:bg-white hover:text-primary-blue transition-colors text-sm md:text-base font-medium"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave shape divider */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 bg-white"
        style={{
          clipPath: "polygon(0 40%, 100% 0%, 100% 100%, 0 100%)",
        }}
      ></div>
    </section>
  )
}
