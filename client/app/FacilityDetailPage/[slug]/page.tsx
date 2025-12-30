// USE CASE #5: Melihat Detail Ruangan - [View]
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
    MapPin,
    Users,

    Calendar,
    ChevronLeft,
    ChevronRight,
    Building2,
    Info,
    Wrench,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { BookingForm } from "@/components/BookingForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";


interface Facility {
    facility_id: number;
    name: string;
    description?: string;
    capacity?: number;
    building_name?: string;
    type_name?: string;
    photo_url?: string;
    image_url?: string;
    maintenance_until?: string;
    maintenance_reason?: string;
    floor?: number;
    room_number?: string;
}

interface Booking {
    id: number;
    startTime: string;
    endTime: string;
    bookedBy: string;
    purpose: string;
}

export default function FacilityDetailPage() {
    const { slug } = useParams();
    const router = useRouter();
    const { data: session } = useSession();

    const [facility, setFacility] = useState<Facility | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [bookingsForDate, setBookingsForDate] = useState<Record<string, Booking[]>>({});
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Time slots from 05:00 to 21:00
    const timeSlots = Array.from({ length: 17 }, (_, i) => {
        const hour = i + 5;
        return `${hour.toString().padStart(2, "0")}:00`;
    });

    // Fetch facility details
    useEffect(() => {
        // [USE CASE #5] Melihat Detail Ruangan - Fetch data detail fasilitas
        const fetchFacility = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/facilities/slug/${slug}`);
                // Handle various response formats
                const facilityData = (res as any)?.data || res;
                setFacility(facilityData as Facility);
            } catch (error) {
                console.error("Failed to fetch facility:", error);
                toast.error("Failed to load facility details");
                // Try fetching by ID if slug doesn't work
                try {
                    const resById = await api.get(`/facilities/${slug}`);
                    const facilityData = (resById as any)?.data || resById;
                    setFacility(facilityData as Facility);
                } catch {
                    router.push("/CheckAvailabilityPage");
                }
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchFacility();
    }, [slug, router]);

    // Rating hooks


    // Fetch bookings when date is selected
    useEffect(() => {
        // [USE CASE #6] Melihat Jadwal dan Ketersediaan Fasilitas - Fetch ketersediaan
        const fetchBookings = async () => {
            if (!selectedDate || !facility?.facility_id) return;

            try {
                setBookingsLoading(true);
                const res = await api.get(
                    `/facilities/${facility.facility_id}/reservations?date=${selectedDate}`
                );
                const data = (Array.isArray(res) ? res : (res as any).data) || [];

                const bookingsMap: Record<string, Booking[]> = {};
                timeSlots.forEach((slot) => {
                    const slotBookings = data.filter((b: any) => {
                        const bStart = b.startTime?.substring(0, 5);
                        const bEnd = b.endTime?.substring(0, 5);
                        return slot >= bStart && slot < bEnd;
                    });
                    if (slotBookings.length > 0) {
                        bookingsMap[slot] = slotBookings;
                    }
                });

                setBookingsForDate(bookingsMap);
            } catch (error) {
                console.error("Failed to fetch bookings:", error);
            } finally {
                setBookingsLoading(false);
            }
        };

        fetchBookings();
    }, [selectedDate, facility?.facility_id]);

    // Calendar helpers
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: days }, (_, i) => i + 1);
    };

    const navigateMonth = (direction: number) => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1)
        );
    };

    const formatDateForApi = (day: number) => {
        const year = currentMonth.getFullYear();
        const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
        const d = String(day).padStart(2, "0");
        return `${year}-${month}-${d}`;
    };

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
    ).getDay();

    const isMaintenanceActive =
        facility?.maintenance_until && new Date(facility.maintenance_until) > new Date();

    const imageUrl = facility?.image_url || facility?.photo_url;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-7xl mx-auto px-4 py-12 mt-16">
                    <Skeleton className="h-64 w-full mb-8 rounded-xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Skeleton className="h-96 col-span-2 rounded-xl" />
                        <Skeleton className="h-96 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!facility) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Fasilitas tidak ditemukan
                    </h2>
                    <Button onClick={() => router.push("/CheckAvailabilityPage")}>
                        Kembali ke Daftar Fasilitas
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />

            <div className="max-w-7xl mx-auto px-4 py-12 mt-16">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4 text-gray-600 hover:text-gray-900"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </Button>

                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        {/* Hero Image */}
                        <div className="relative h-64 md:h-96 bg-gray-200">
                            {imageUrl ? (
                                <Image
                                    src={imageUrl}
                                    alt={facility.name}
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/placeholder.svg";
                                    }}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <Building2 className="w-24 h-24" />
                                </div>
                            )}

                            {/* Status Badge */}
                            <div className="absolute top-4 right-4">
                                {isMaintenanceActive ? (
                                    <Badge variant="destructive" className="text-sm px-4 py-2">
                                        <Wrench className="w-4 h-4 mr-2" />
                                        Maintenance
                                    </Badge>
                                ) : (
                                    <Badge className="bg-green-600 hover:bg-green-700 text-sm px-4 py-2">
                                        Available
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="p-6 md:p-8">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {facility.name}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-[#FA7436]" />
                                            <span>{facility.building_name || "Unknown Building"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-[#FA7436]" />
                                            <span>{facility.capacity || 0} orang</span>
                                        </div>
                                        {facility.type_name && (
                                            <Badge variant="secondary">{facility.type_name}</Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Rating */}

                            </div>

                            {facility.description && (
                                <p className="mt-4 text-gray-600 leading-relaxed">
                                    {facility.description}
                                </p>
                            )}

                            {isMaintenanceActive && facility.maintenance_reason && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <Info className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-red-700">
                                                Fasilitas sedang dalam maintenance
                                            </p>
                                            <p className="text-sm text-red-600 mt-1">
                                                {facility.maintenance_reason}
                                            </p>
                                            <p className="text-sm text-red-600">
                                                Sampai:{" "}
                                                {new Date(facility.maintenance_until!).toLocaleDateString("id-ID")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Calendar & Availability */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Calendar */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[#FA7436]" />
                                    Pilih Tanggal
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center mb-6">
                                    <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <h3 className="text-lg font-semibold">
                                        {currentMonth.toLocaleDateString("id-ID", {
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </h3>
                                    <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
                                        <div
                                            key={day}
                                            className="text-center font-medium text-gray-500 py-2 text-sm"
                                        >
                                            {day}
                                        </div>
                                    ))}

                                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                        <div key={`empty-${i}`} className="py-2"></div>
                                    ))}

                                    {daysInMonth.map((day) => {
                                        const dateStr = formatDateForApi(day);
                                        const isSelected = selectedDate === dateStr;
                                        const today = new Date();
                                        const dateObj = new Date(
                                            currentMonth.getFullYear(),
                                            currentMonth.getMonth(),
                                            day
                                        );
                                        const isPast = dateObj < new Date(today.setHours(0, 0, 0, 0));

                                        return (
                                            <button
                                                key={day}
                                                onClick={() => !isPast && setSelectedDate(dateStr)}
                                                disabled={isPast}
                                                className={`text-center py-2 border rounded-lg transition-colors ${isSelected
                                                    ? "bg-[#FA7436] text-white border-[#FA7436]"
                                                    : isPast
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : "bg-white border-gray-200 hover:border-[#FA7436] hover:bg-orange-50"
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>

                                {selectedDate && (
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
                                        <p className="font-medium text-blue-800">
                                            Tanggal terpilih: {selectedDate}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Time Slots */}
                        {selectedDate && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ketersediaan Jam pada {selectedDate}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {bookingsLoading ? (
                                        <div className="grid grid-cols-4 gap-3">
                                            {Array.from({ length: 8 }).map((_, i) => (
                                                <Skeleton key={i} className="h-16 rounded-lg" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                            {timeSlots.map((time) => {
                                                const isAvailable = !bookingsForDate[time];
                                                const bookingInfo = bookingsForDate[time]?.[0];

                                                return (
                                                    <div
                                                        key={time}
                                                        className={`p-3 rounded-lg border text-center ${isAvailable
                                                            ? "bg-green-50 border-green-200 text-green-800"
                                                            : "bg-red-50 border-red-200 text-red-800"
                                                            }`}
                                                    >
                                                        <div className="font-bold">{time}</div>
                                                        <div className="text-xs mt-1">
                                                            {isAvailable ? "Tersedia" : "Terpesan"}
                                                        </div>
                                                        {!isAvailable && bookingInfo && (
                                                            <div
                                                                className="text-xs mt-1 truncate"
                                                                title={bookingInfo.purpose}
                                                            >
                                                                {bookingInfo.bookedBy}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Reviews Section */}

                    </div>

                    {/* Right Column - Booking Form */}
                    <div className="lg:col-span-1">
                        {selectedDate && !isMaintenanceActive ? (
                            <BookingForm
                                facilityId={facility.facility_id}
                                facilityName={facility.name}
                                selectedDate={selectedDate}
                                existingBookings={bookingsForDate}
                                onSuccess={() => {
                                    // Refresh bookings
                                    setSelectedDate(selectedDate);
                                }}
                                className="sticky top-24"
                            />
                        ) : (
                            <Card className="sticky top-24">
                                <CardContent className="py-12 text-center">
                                    {isMaintenanceActive ? (
                                        <>
                                            <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                                Fasilitas Tidak Tersedia
                                            </h3>
                                            <p className="text-gray-500">
                                                Fasilitas ini sedang dalam maintenance dan tidak dapat dipesan.
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                                Pilih Tanggal
                                            </h3>
                                            <p className="text-gray-500">
                                                Silakan pilih tanggal pada kalender untuk melihat ketersediaan dan
                                                melakukan pemesanan.
                                            </p>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
