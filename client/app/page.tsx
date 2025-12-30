// [USE CASE #4] Mencari Fasilitas - Landing Page View
"use client";

import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FacilitiesSection from "@/components/FacilitiesSection";
import MostValuablePlaces from "@/components/MostValuablePlaces";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navigation />
      <HeroSection />
      <FacilitiesSection />
      <MostValuablePlaces />
      <ContactSection />
      <Footer />
    </>
  );
}

