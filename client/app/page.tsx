// [USE CASE #4] Mencari Fasilitas - Landing Page View
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FacilitiesSection from "@/components/FacilitiesSection";
import MostValuablePlaces from "@/components/MostValuablePlaces";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // @ts-ignore - role is added to session
  const userRole = session?.user?.role;

  useEffect(() => {
    // Redirect admin to Admin Dashboard
    if (status === "authenticated" && userRole === "admin") {
      router.replace("/AdminDashboard");
    }
  }, [status, userRole, router]);

  // Show loading while checking session for admin
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect admin - show loading while redirecting
  if (userRole === "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-500">Redirecting to Admin Dashboard...</p>
        </div>
      </div>
    );
  }

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
