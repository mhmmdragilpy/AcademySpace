"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Facility, FacilityType } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { FacilityDetailModal } from "./FacilityDetailModal";

// Group facilities by building
interface BuildingGroup {
  building: string;
  building_id: number | null | undefined;
  image_url?: string | null;
  rooms: Facility[];
}

const ExploreSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // Fetch all facilities from API
  const { data: facilities, isLoading, isError } = useQuery({
    queryKey: ['all-facilities-v4'], // Updated version to bust cache
    queryFn: async () => {
      const res = await api.get('/facilities');
      return res as unknown as Facility[];
    },
    staleTime: 1000 * 60, // 1 minute
  });

  // Fetch facility types for classification
  const { data: facilityTypes } = useQuery({
    queryKey: ['facility-types'],
    queryFn: async () => {
      const res = await api.get('/facility-types');
      return res as unknown as FacilityType[];
    }
  });

  // Filter facilities by type and search
  const filteredByType = useMemo(() => {
    if (!facilities) return [];
    if (!selectedType) return facilities;
    return facilities.filter(f => f.type_id === selectedType);
  }, [facilities, selectedType]);

  // Group facilities by building
  const groupedFacilities: BuildingGroup[] = useMemo(() => {
    const filtered = filteredByType;
    if (!filtered) return [];

    const grouped = filtered.reduce((acc: BuildingGroup[], facility) => {
      const buildingName = facility.building_name || "Other";
      let buildingGroup = acc.find(g => g.building === buildingName);

      if (!buildingGroup) {
        buildingGroup = {
          building: buildingName,
          building_id: facility.building_id,
          image_url: facility.image_url || facility.photo_url,
          rooms: []
        };
        acc.push(buildingGroup);
      }

      buildingGroup.rooms.push(facility);
      return acc;
    }, []);

    return grouped;
  }, [filteredByType]);

  // Filter by search term
  const searchFilteredFacilities = useMemo(() => {
    if (!searchTerm) return groupedFacilities;

    const searchLower = searchTerm.toLowerCase();
    return groupedFacilities
      .map(building => ({
        ...building,
        rooms: building.rooms.filter(room =>
          room.name.toLowerCase().includes(searchLower) ||
          building.building.toLowerCase().includes(searchLower)
        )
      }))
      .filter(building => building.rooms.length > 0);
  }, [groupedFacilities, searchTerm]);

  const totalFacilities = groupedFacilities.length;
  const totalRooms = filteredByType?.length || 0;

  return (
    <div id="explore" className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Beranda</h2>
          <p className="mt-2 text-lg text-gray-600">Informasi Gedung dan Ruangan</p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-3xl font-bold text-[#FA7436]">{totalFacilities}</h3>
            <p className="text-gray-600 mt-2">Gedung Tersedia</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-3xl font-bold text-[#FA7436]">{totalRooms}</h3>
            <p className="text-gray-600 mt-2">Ruangan Tersedia</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-3xl font-bold text-[#FA7436]">98%</h3>
            <p className="text-gray-600 mt-2">Tingkat Kepuasan</p>
          </div>
        </div>

        {/* Classification Pills */}
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

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari gedung atau ruangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-11 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FA7436] font-poppins shadow-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Buildings with Rooms */}
        {isLoading ? (
          <div className="space-y-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden p-6">
                <Skeleton className="h-8 w-64 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-32 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-600">
            Failed to load facilities. Please try again later.
          </div>
        ) : searchFilteredFacilities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm
              ? `Tidak ada fasilitas yang cocok dengan pencarian "${searchTerm}"`
              : selectedType
                ? "Tidak ada fasilitas untuk kategori ini"
                : "Tidak ada fasilitas yang tersedia"}
          </div>
        ) : (
          <div className="space-y-12">
            {searchFilteredFacilities.map((building, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="h-16 w-16 overflow-hidden rounded-lg mr-4">
                      {building.image_url ? (
                        <Image
                          src={building.image_url}
                          alt={building.building}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{building.building}</h3>
                      <p className="text-gray-600">{building.rooms.length} ruangan tersedia</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {building.rooms.map((room, roomIndex) => (
                      <div
                        key={roomIndex}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{room.name}</h4>
                            {room.type_name && (
                              <span className="inline-block text-xs px-2 py-1 bg-[#FA7436]/10 text-[#FA7436] rounded-full mt-1">
                                {room.type_name}
                              </span>
                            )}
                            <p className="text-gray-600 text-sm mt-1">Kapasitas: {room.capacity || 'N/A'} orang</p>
                            <p className="text-gray-700 text-sm mt-2 line-clamp-2">
                              {room.description || room.generic_description || room.layout_description || "No description available"}
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedFacility(room)}
                            className="bg-[#08294B] text-white text-xs px-3 py-1 rounded hover:bg-[#0a3a6e] transition-colors whitespace-nowrap ml-2"
                          >
                            Cek
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedFacility && (
          <FacilityDetailModal
            facility={selectedFacility}
            isOpen={!!selectedFacility}
            onClose={() => setSelectedFacility(null)}
          />
        )}

        <div className="mt-12 text-center">
          <Link href="/cek-ketersediaan">
            <button className="bg-[#FA7436] text-white font-medium py-3 px-8 rounded-lg hover:bg-[#e5672f] transition-colors">
              Lihat Semua Fasilitas
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ExploreSection;