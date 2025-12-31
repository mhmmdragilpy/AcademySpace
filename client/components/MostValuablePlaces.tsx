"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api";
import { Facility } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const MostValuablePlaces = () => {
  // Fetch top 3 facilities by capacity from API
  const { data: places, isLoading } = useQuery({
    queryKey: ['top-facilities'],
    queryFn: async () => {
      const res = await api.get('/facilities');
      const facilities = res as unknown as Facility[];

      // Sort by capacity descending and take top 3
      return facilities
        .filter(f => f.capacity && f.capacity > 0)
        .sort((a, b) => (b.capacity || 0) - (a.capacity || 0))
        .slice(0, 3);
    }
  });

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Tempat Paling Bernilai</h2>
          <p className="mt-2 text-lg text-gray-600">Fasilitas dengan kapasitas terbesar di kampus</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg shadow-md overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {places?.map((place) => {
              // Use facility_id as slug for reliable routing
              const slug = place.facility_id;
              return (
                <div key={place.facility_id} className="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 overflow-hidden relative bg-gray-200">
                    {place.photo_url || place.image_url ? (
                      <Image
                        src={place.photo_url || place.image_url || ""}
                        alt={place.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p className="text-sm">No Image</p>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900">{place.name}</h3>
                    <p className="text-[#FA7436] font-medium">{place.building_name || "Campus"}</p>
                    <p className="text-gray-600 mt-2 line-clamp-2">
                      {place.description || place.layout_description || "Fasilitas premium untuk kegiatan akademik"}
                    </p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">Kapasitas: {place.capacity || 0} orang</span>
                      <Link
                        href={`/FacilityDetailPage/${slug}`}
                        className="bg-[#07294B] text-white px-4 py-2 rounded-lg hover:bg-[#051a30] transition-colors"
                      >
                        Cek
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/#facilities-section"
            className="bg-[#FA7436] text-white font-medium py-3 px-8 rounded-lg hover:bg-[#e5672f] transition-colors inline-block"
          >
            Lihat Semua Fasilitas
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MostValuablePlaces;