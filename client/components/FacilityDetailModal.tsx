"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Facility } from "@/types";
import Image from "next/image";
import { Users, MapPin, CheckCircle2, Calendar, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";

interface FacilityDetailModalProps {
    facility: Facility | null;
    isOpen: boolean;
    onClose: () => void;
}

export function FacilityDetailModal({
    facility,
    isOpen,
    onClose,
}: FacilityDetailModalProps) {
    if (!facility) return null;

    const imageUrl = facility.image_url || facility.photo_url;
    const slug = facility.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white rounded-xl shadow-2xl border-0">
                <div className="relative h-72 w-full bg-gray-100 group">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={facility.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                            }}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground bg-gray-200">
                            <div className="text-center">
                                <MapPin size={48} className="mx-auto mb-2 text-gray-400" />
                                <p>No Image Available</p>
                            </div>
                        </div>
                    )}
                    <div className="absolute top-4 left-4 z-10">
                        {facility.maintenance_until && new Date(facility.maintenance_until) > new Date() ? (
                            <Badge className="text-sm px-3 py-1 bg-red-500 hover:bg-red-600">
                                Maintenance
                            </Badge>
                        ) : (
                            <Badge className="text-sm px-3 py-1 bg-green-500 hover:bg-green-600">
                                Available
                            </Badge>
                        )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                        <DialogTitle className="text-3xl font-bold text-white drop-shadow-md mb-1">{facility.name}</DialogTitle>
                        <div className="flex items-center gap-2 text-white/90">
                            <MapPin size={16} />
                            <span>{facility.building_name || "Unknown Building"}</span>
                            {facility.room_number && <span>• Room {facility.room_number}</span>}
                            {facility.floor && <span>• Floor {facility.floor}</span>}
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                <DialogDescription className="text-gray-600 leading-relaxed text-base">
                                    {facility.description || "No description available for this facility."}
                                </DialogDescription>
                            </div>

                            {facility.layout_description && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Layout & Setup</h3>
                                    <p className="text-gray-600 leading-relaxed text-base">
                                        {facility.layout_description}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Details</h3>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Capacity</p>
                                        <p className="font-semibold text-gray-900">{facility.capacity || 0} People</p>
                                    </div>
                                </div>

                                {facility.type_name && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Type</p>
                                            <p className="font-semibold text-gray-900">{facility.type_name}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {facility.maintenance_until && new Date(facility.maintenance_until) > new Date() ? (
                                <div className="space-y-2">
                                    <Button disabled className="w-full bg-red-100 text-red-600 hover:bg-red-100 cursor-not-allowed shadow-none text-lg py-6">
                                        <Wrench className="mr-2 h-5 w-5" />
                                        Under Maintenance
                                    </Button>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-red-600">
                                            Until: {new Date(facility.maintenance_until).toLocaleDateString()}
                                        </p>
                                        {facility.maintenance_reason && (
                                            <p className="text-xs text-gray-500 mt-1 italic">
                                                "{facility.maintenance_reason}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <Button asChild className="w-full bg-[#FA7436] hover:bg-[#e5672f] shadow-lg text-lg py-6">
                                    <Link href={`/availability/${slug}`}>
                                        <Calendar className="mr-2 h-5 w-5" />
                                        Book Now
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
