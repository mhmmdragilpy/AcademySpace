// USE CASE #4: Mencari Fasilitas - [View]
// USE CASE #18: Menyaring Pencarian Fasilitas - [View]
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Users, MapPin, Search, Calendar } from "lucide-react";
import { Facility } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useFacilities, useFacilityTypes } from "@/hooks/useFacilities";

import { FacilityDetailPopup } from "./FacilityDetailPopup";
import { FacilityCard } from "./FacilityCard";

// FacilityCard extracted to separate file

export default function FacilitiesSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"facilities">("facilities");
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: facilities, isLoading, isError } = useFacilities({ search: debouncedSearch });
  const { data: facilityTypes } = useFacilityTypes();

  // Filter client-side by type if needed (or backend if supported)
  // useFacilities currently only supports search term filtering in the hook shown previously
  const filteredFacilities = utilitiesFilter(facilities || [], selectedType);

  // [USE CASE #18] Menyaring Pencarian Fasilitas - Filter Data Fasilitas
  function utilitiesFilter(list: Facility[], type: number | null) {
    if (!type) return list;
    return list.filter(f => Number(f.type_id) === Number(type));
  }

  // Tools data removed in favor of real data


  return (
    <section id="facilities-section" className="py-16 bg-secondary/30 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Explore & Book
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find the perfect facility for your event or academic needs.
          </p>

          <div className="max-w-xl mx-auto mt-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, building..."
              className="pl-9 bg-background h-12 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 border-b max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("facilities")}
            className={`flex-1 pb-4 text-sm font-medium transition-colors relative ${activeTab === "facilities" ? "text-primary" : "text-muted-foreground"
              }`}
          >
            Facilities
            {activeTab === "facilities" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Classification Pills (Facilities only) */}
        {activeTab === "facilities" && (
          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedType === null
                ? 'bg-[#FA7436] text-white shadow-md'
                : 'bg-white text-gray-700 border hover:border-[#FA7436] hover:text-[#FA7436]'
                }`}
            >
              All
            </button>
            {(facilityTypes || []).map((type) => (
              <button
                key={type.type_id}
                onClick={() => setSelectedType(type.type_id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedType === type.type_id
                  ? 'bg-[#FA7436] text-white shadow-md'
                  : 'bg-white text-gray-700 border hover:border-[#FA7436] hover:text-[#FA7436]'
                  }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {activeTab === "facilities" && (
          <>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="text-center text-destructive">
                Failed to load facilities. Please try again later.
              </div>
            ) : filteredFacilities.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No facilities found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
                {filteredFacilities.map((facility) => (
                  <FacilityCard key={facility.facility_id} facility={facility} onSelect={setSelectedFacility} />
                ))}
              </div>
            )}
          </>
        )}



        <FacilityDetailPopup
          facility={selectedFacility}
          isOpen={!!selectedFacility}
          onClose={() => setSelectedFacility(null)}
        />
      </div>
    </section>
  );
}