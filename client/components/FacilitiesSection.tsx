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

interface FacilityCardProps {
  facility: Facility;
}

const FacilityCard = ({ facility }: FacilityCardProps) => {
  const imageUrl = facility.image_url || facility.photo_url;
  const slug = facility.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  return (
    <div className="block group h-full">
      <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        <div className="relative h-48 bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={facility.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground bg-gray-200">
              <div className="text-center">
                <MapPin size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No Image</p>
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant={facility.is_active ? "default" : "secondary"}>
              {facility.is_active ? "Available" : "Maintenance"}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg line-clamp-1">{facility.name}</h3>
            <div className="flex items-center gap-1 text-xs font-semibold bg-secondary px-2 py-1 rounded">
              <Users size={12} />
              <span>{facility.capacity}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin size={14} className="text-primary" />
            <span>{facility.building_name || "Unknown Building"}</span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
            {facility.description}
          </p>

          <Button asChild className="w-full mt-4 bg-[#FA7436] hover:bg-[#e5672f]">
            <Link href={`/availability/${slug}`}>
              <Calendar className="w-4 h-4 mr-2" />
              Book Now
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default function FacilitiesSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"facilities" | "tools">("facilities");
  const [selectedType, setSelectedType] = useState<number | null>(null);

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

  function utilitiesFilter(list: Facility[], type: number | null) {
    if (!type) return list;
    return list.filter(f => Number(f.type_id) === Number(type));
  }

  // Tools data
  const toolsContent = [
    { id: "1", name: "Projector", description: "High-quality projectors available for presentations" },
    { id: "2", name: "Whiteboard", description: "Interactive whiteboards for collaborative work" },
    { id: "3", name: "Sound System", description: "Professional audio equipment for events" },
    { id: "4", name: "Video Conference", description: "Video conferencing equipment and setup" },
    { id: "5", name: "Computer Lab", description: "Full computer stations with software" },
    { id: "6", name: "Kitchen Equipment", description: "Professional kitchen tools and appliances" },
  ];

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
          <button
            onClick={() => setActiveTab("tools")}
            className={`flex-1 pb-4 text-sm font-medium transition-colors relative ${activeTab === "tools" ? "text-primary" : "text-muted-foreground"
              }`}
          >
            Equipment
            {activeTab === "tools" && (
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
                  <FacilityCard key={facility.facility_id} facility={facility} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "tools" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {toolsContent.map((tool) => (
              <Card key={tool.id} className="border-none shadow-md hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">{tool.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                  <Button variant="outline" className="w-full text-sm">
                    Check Availability
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}