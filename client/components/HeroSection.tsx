"use client";

import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative w-full h-screen overflow-hidden -mt-24">
      {/* Background Image with lighter overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/Hero.png"
          alt="Campus Hero"
          fill
          className="object-cover object-right"
          priority
        />
        {/* Reduced opacity gradient for better building visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#08294B]/90 via-[#08294B]/50 to-transparent" />
      </div>

      {/* Content - Left aligned */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="text-[#FA7436]">Booking</span> a spot
              <br />
              is now much easier
            </h1>

            {/* Short Subtitle */}
            <p className="text-white/90 text-xl md:text-2xl font-light">
              Find and reserve a spot in campus for your necessities
            </p>
          </div>
        </div>
      </div>

      {/* Wave shape divider at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 bg-white z-20"
        style={{
          clipPath: "polygon(0 60%, 100% 0%, 100% 100%, 0 100%)",
        }}
      />
    </section>
  );
}