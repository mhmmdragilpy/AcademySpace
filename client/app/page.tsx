"use client";

import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FacilitiesSection from "@/components/FacilitiesSection";
import MostValuablePlaces from "@/components/MostValuablePlaces";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
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

