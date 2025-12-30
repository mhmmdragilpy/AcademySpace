"use client";

import Image from "next/image";
import { Users, MapPin, Calendar } from "lucide-react";
import { Facility } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FacilityCardProps {
    facility: Facility;
    onSelect: (facility: Facility) => void;
}

export function FacilityCard({ facility, onSelect }: FacilityCardProps) {
    const imageUrl = facility.image_url || facility.photo_url;

    return (
        <div className="block group h-full cursor-pointer" onClick={() => onSelect(facility)}>
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
                        {facility.maintenance_until && new Date(facility.maintenance_until) > new Date() ? (
                            <Badge variant="destructive">
                                Maintenance
                            </Badge>
                        ) : (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                Available
                            </Badge>
                        )}
                    </div>
                </div>
                <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg line-clamp-1 group-hover:text-[#FA7436] transition-colors">{facility.name}</h3>
                        <div className="flex items-center gap-1 text-xs font-semibold bg-secondary px-2 py-1 rounded">
                            <Users size={12} />
                            <span>{facility.capacity}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin size={14} className="text-primary" />
                        <span>{facility.building_name || "Unknown Building"}</span>
                    </div>

                    <Button className="w-full mt-4 bg-[#FA7436] hover:bg-[#e5672f]">
                        <Calendar className="w-4 h-4 mr-2" />
                        View Details
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
