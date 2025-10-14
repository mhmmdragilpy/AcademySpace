"use client"

import Image from "next/image"

export default function MostValuablePlaces() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-poppins text-black">
            Most <span className="text-primary-orange">Valuable</span> Places
          </h2>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Left Image */}
          <div className="relative h-80 bg-gray-300 rounded-lg overflow-hidden">
            <Image src="/images/LEFT_TO_MIDDLE.jpeg" alt="Left valuable place" fill className="object-cover" />
          </div>

          {/* Middle Image */}
          <div className="relative h-80 bg-gray-300 rounded-lg overflow-hidden">
            <Image src="/images/MIDDLE_FOOTER_IMAGE.png" alt="Middle valuable place" fill className="object-cover" />
          </div>

          {/* Right Image */}
          <div className="relative h-80 bg-gray-300 rounded-lg overflow-hidden">
            <Image src="/images/RIGHT_TO_MIDDLE.jpg" alt="Right valuable place" fill className="object-cover" />
          </div>
        </div>

        {/* Description */}
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 text-base leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur.
          </p>
        </div>

        {/* Dots Navigation (optional indicator) */}
        <div className="flex justify-center gap-2 mt-12">
          <div className="w-2 h-2 rounded-full bg-primary-orange"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </section>
  )
}
