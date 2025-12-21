"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Users, MapPin, Calendar, Search } from "lucide-react";
import { Facility, FacilityType } from "@/types";
import { useFacilities, useFacilityTypes } from "@/hooks/useFacilities";

interface FacilityCard {
  id: string;
  name: string;
  image: string;
  capacity: number;
  description: string;
  location: string;
  slug: string;
  type_name?: string;
}

export default function AvailabilityPage() {
  const [activeTab, setActiveTab] = useState("facilities");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState<number | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch facilities with Custom Hook
  const { data: facilities, isLoading } = useFacilities({ search: debouncedSearch });

  // Fetch facility types for classification
  const { data: facilityTypes } = useFacilityTypes();

  // Transform and filter facilities
  const transformedFacilities: FacilityCard[] = (facilities || [])
    .filter(facility => !selectedType || facility.type_id === selectedType)
    .map((facility) => ({
      id: facility.facility_id.toString(),
      name: facility.name,
      image: facility.photo_url || facility.image_url || "/images/rooms/TULT/Area_Makan_TULT_Lt.16.jpg",
      capacity: facility.capacity || 0,
      description: facility.description || facility.layout_description || "Facility description available.",
      location: facility.building_name || "Campus Building",
      slug: facility.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      type_name: facility.type_name
    }));

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Heading */}
          <div className="mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-poppins font-bold mb-4">
              <span className="text-primary-orange">Check</span>{" "}
              <span className="text-black">Availability</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto font-poppins">
              Browse our facilities and tools, and check real-time availability.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8 relative">
            <div className="relative flex items-center w-full h-12 rounded-full focus-within:shadow-lg bg-white shadow-md border border-gray-200 overflow-hidden transition-shadow duration-300">
              <div className="grid place-items-center h-full w-12 text-gray-300">
                <Search size={20} />
              </div>

              <input
                className="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
                type="text"
                id="search"
                placeholder="Search for facilities, buildings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Tabs - Centered with underline */}
          <div className="flex justify-center gap-12 mb-8 relative pb-4">
            {/* Facility Tab */}
            <div className="relative">
              <button
                onClick={() => setActiveTab("facilities")}
                className={`font-poppins text-lg pb-2 transition-all duration-300 ${activeTab === "facilities" ? "text-primary-orange" : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                Facility
              </button>
              {activeTab === "facilities" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-orange rounded-t-lg"></div>
              )}
            </div>
          </div>

          {/* Classification Pills (Only for facilities tab) */}
          {activeTab === "facilities" && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setSelectedType(null)}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${selectedType === null
                    ? 'bg-[#FA7436] text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-[#FA7436] hover:text-[#FA7436]'
                    }`}
                >
                  Semua
                </button>
                {(facilityTypes || []).map((type, index) => (
                  <button
                    key={`type-${type.type_id}-${index}`}
                    onClick={() => setSelectedType(type.type_id)}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${selectedType === type.type_id
                      ? 'bg-[#FA7436] text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-[#FA7436] hover:text-[#FA7436]'
                      }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "facilities" && (
            <div className="animate-fadeIn">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto"></div>
                  <p className="mt-4 text-gray-600 font-poppins">Loading facilities...</p>
                </div>
              ) : (
                <>
                  {transformedFacilities.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 font-poppins text-lg">
                        {searchTerm
                          ? `No facilities found matching "${searchTerm}"`
                          : selectedType
                            ? "Tidak ada fasilitas untuk kategori ini"
                            : "No facilities available"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      {transformedFacilities.map((facility) => (
                        <div
                          key={facility.id}
                          className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col"
                        >
                          {/* Card Image */}
                          <div className="relative h-40 bg-gray-300">
                            <Image
                              src={facility.image}
                              alt={facility.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Card Content */}
                          <div className="p-4 flex-1 flex flex-col">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-poppins font-bold text-gray-800 line-clamp-1 flex-1" title={facility.name}>
                                {facility.name}
                              </h3>
                              <span className="inline-flex items-center gap-1 text-[#FFCA00] text-sm font-poppins font-semibold flex-shrink-0">
                                <Users size={16} />
                                <span className="text-black font-light">{facility.capacity}</span>
                              </span>
                            </div>

                            {facility.type_name && (
                              <span className="inline-block text-xs px-2 py-1 bg-[#FA7436]/10 text-[#FA7436] rounded-full mb-2 w-fit">
                                {facility.type_name}
                              </span>
                            )}

                            <div className="flex items-center gap-2 mb-2">
                              <MapPin size={16} className="text-[#FA7436] flex-shrink-0" />
                              <span className="text-[#FA7436] text-sm font-poppins font-semibold line-clamp-1">
                                {facility.location}
                              </span>
                            </div>

                            <p className="text-gray-600 text-sm font-poppins mb-4 line-clamp-2 flex-1">
                              {facility.description}
                            </p>

                            <Link
                              href={`/availability/${facility.slug}`}
                              className="w-full bg-[#FA7436] text-white font-medium py-2 rounded-lg hover:bg-[#e5672f] transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-md"
                            >
                              <Calendar size={16} />
                              Check Availability
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}


        </div>
      </main >

      <Footer />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
}