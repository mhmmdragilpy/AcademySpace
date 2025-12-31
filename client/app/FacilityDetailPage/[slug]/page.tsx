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
    Clock,
    Layers,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Sparkles,
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

    // @ts-ignore - role is added to session
    const userRole = session?.user?.role;
    const isAdmin = userRole === 'admin';

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
        const fetchFacility = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/facilities/slug/${slug}`);
                const facilityData = (res as any)?.data || res;
                setFacility(facilityData as Facility);
            } catch (error) {
                console.error("Failed to fetch facility:", error);
                toast.error("Failed to load facility details");
                try {
                    const resById = await api.get(`/facilities/${slug}`);
                    const facilityData = (resById as any)?.data || resById;
                    setFacility(facilityData as Facility);
                } catch {
                    router.push("/");
                }
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchFacility();
    }, [slug, router]);

    // Fetch bookings when date is selected
    useEffect(() => {
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

    const formatDisplayDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
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

    // Loading skeleton with modern design
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
                <Navigation />
                <div className="pt-20">
                    <Skeleton className="h-[50vh] w-full" />
                    <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-10">
                        <div className="bg-white rounded-3xl shadow-2xl p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <Skeleton className="h-10 w-3/4" />
                                    <Skeleton className="h-6 w-1/2" />
                                    <Skeleton className="h-32 w-full" />
                                </div>
                                <Skeleton className="h-96 rounded-2xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Not found state
    if (!facility) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center">
                <div className="text-center px-4">
                    <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Building2 className="w-12 h-12 text-orange-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        Fasilitas tidak ditemukan
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Fasilitas yang Anda cari mungkin telah dihapus atau tidak tersedia.
                    </p>
                    <Button
                        onClick={() => router.push("/")}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
            <Navigation />

            {/* Hero Section with Immersive Image */}
            <div className="relative h-[50vh] min-h-[400px] max-h-[600px] w-full overflow-hidden">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={facility.name}
                        fill
                        className="object-cover"
                        priority
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                        <Building2 className="w-32 h-32 text-slate-600" />
                    </div>
                )}

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

                {/* Back Button */}
                <div className="absolute top-24 left-4 md:left-8 z-20">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 hover:text-white rounded-full px-4"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Kembali
                    </Button>
                </div>

                {/* Status Badge */}
                <div className="absolute top-24 right-4 md:right-8 z-20">
                    {isMaintenanceActive ? (
                        <div className="flex items-center gap-2 bg-red-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg">
                            <Wrench className="w-4 h-4 animate-pulse" />
                            <span className="font-medium">Dalam Maintenance</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-emerald-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg">
                            <Sparkles className="w-4 h-4" />
                            <span className="font-medium">Tersedia</span>
                        </div>
                    )}
                </div>

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            {facility.type_name && (
                                <span className="px-3 py-1 bg-orange-500/90 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                                    {facility.type_name}
                                </span>
                            )}
                            {facility.floor && (
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                                    Lantai {facility.floor}
                                </span>
                            )}
                            {facility.room_number && (
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                                    Room {facility.room_number}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                            {facility.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-white/90">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <span>{facility.building_name || "Unknown Building"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Users className="w-4 h-4" />
                                </div>
                                <span>{facility.capacity || 0} orang</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10 pb-16">
                {/* Quick Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-blue-500/30">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm text-gray-500">Kapasitas</p>
                        <p className="text-2xl font-bold text-gray-900">{facility.capacity || 0}</p>
                        <p className="text-xs text-gray-400">orang</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/30">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm text-gray-500">Gedung</p>
                        <p className="text-lg font-bold text-gray-900 truncate">{facility.building_name || "-"}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-purple-500/30">
                            <Layers className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm text-gray-500">Lantai</p>
                        <p className="text-2xl font-bold text-gray-900">{facility.floor || "-"}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-orange-500/30">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm text-gray-500">Jam Operasional</p>
                        <p className="text-lg font-bold text-gray-900">05:00 - 21:00</p>
                    </div>
                </div>

                {/* Main Content - Single Column Layout */}
                <div className="space-y-8">
                    {/* Description Card */}
                    {facility.description && (
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg shadow-gray-200/50 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Info className="w-5 h-5 text-orange-500" />
                                Tentang Fasilitas
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                {facility.description}
                            </p>
                        </div>
                    )}

                    {/* Maintenance Warning */}
                    {isMaintenanceActive && facility.maintenance_reason && (
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100 shadow-lg">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Wrench className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-800 text-lg mb-2">
                                        Fasilitas Sedang Maintenance
                                    </h3>
                                    <p className="text-red-700 mb-2">
                                        {facility.maintenance_reason}
                                    </p>
                                    <p className="text-sm text-red-600 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Diperkirakan selesai:{" "}
                                        {new Date(facility.maintenance_until!).toLocaleDateString("id-ID", {
                                            weekday: "long",
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric"
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Calendar Section */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg shadow-gray-200/50 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-orange-500" />
                                Pilih Tanggal Reservasi
                            </h2>
                        </div>

                        {/* Month Navigation */}
                        <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-slate-50 to-orange-50/50 rounded-xl p-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigateMonth(-1)}
                                className="hover:bg-white rounded-lg shadow-sm"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <h3 className="text-lg font-bold text-gray-900">
                                {currentMonth.toLocaleDateString("id-ID", {
                                    month: "long",
                                    year: "numeric",
                                })}
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigateMonth(1)}
                                className="hover:bg-white rounded-lg shadow-sm"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-2 mb-4">
                            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
                                <div
                                    key={day}
                                    className="text-center font-semibold text-gray-400 py-2 text-sm"
                                >
                                    {day}
                                </div>
                            ))}

                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} className="py-3"></div>
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
                                // Compare full date string (YYYY-MM-DD) to correctly identify today
                                const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
                                const isToday = dateStr === todayStr;

                                return (
                                    <button
                                        key={day}
                                        onClick={() => !isPast && setSelectedDate(dateStr)}
                                        disabled={isPast}
                                        className={`relative text-center py-3 rounded-xl font-medium transition-all duration-200 ${isSelected
                                            ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/40 scale-105"
                                            : isPast
                                                ? "text-gray-300 cursor-not-allowed"
                                                : isToday
                                                    ? "bg-orange-50 text-orange-600 border-2 border-orange-200 hover:border-orange-400"
                                                    : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                    >
                                        {day}
                                        {isToday && !isSelected && (
                                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Selected Date Display */}
                        {selectedDate && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                <p className="text-blue-800 font-medium flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                    Tanggal dipilih: {formatDisplayDate(selectedDate)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Time Slots Section */}
                    {selectedDate && (
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg shadow-gray-200/50 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-orange-500" />
                                Ketersediaan Waktu
                            </h2>
                            <p className="text-gray-500 mb-6">
                                {formatDisplayDate(selectedDate)}
                            </p>

                            {bookingsLoading ? (
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <Skeleton key={i} className="h-20 rounded-xl" />
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
                                                className={`relative p-4 rounded-xl border-2 text-center transition-all duration-200 ${isAvailable
                                                    ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 hover:border-emerald-400 hover:shadow-md"
                                                    : "bg-gradient-to-br from-red-50 to-orange-50 border-red-200"
                                                    }`}
                                            >
                                                <div className={`font-bold text-lg ${isAvailable ? "text-emerald-700" : "text-red-700"}`}>
                                                    {time}
                                                </div>
                                                <div className={`text-xs mt-1 font-medium flex items-center justify-center gap-1 ${isAvailable ? "text-emerald-600" : "text-red-600"}`}>
                                                    {isAvailable ? (
                                                        <>
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Tersedia
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3 h-3" />
                                                            Terpesan
                                                        </>
                                                    )}
                                                </div>
                                                {!isAvailable && bookingInfo && (
                                                    <div
                                                        className="text-xs mt-1 text-red-500 truncate"
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
                        </div>
                    )}

                    {/* Booking Form Section - Now below time slots */}
                    {/* Admin cannot make reservations */}
                    {isAdmin ? (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg border border-blue-100 text-center">
                            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Info className="w-10 h-10 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Admin Mode
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Sebagai admin, Anda hanya dapat mengelola reservasi, bukan membuat reservasi baru.
                                <br />
                                Gunakan Admin Panel untuk melihat dan mengelola reservasi pengguna.
                            </p>
                            <Button
                                onClick={() => router.push("/AdminDashboard")}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali ke Admin Dashboard
                            </Button>
                        </div>
                    ) : selectedDate && !isMaintenanceActive ? (
                        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                                <h3 className="font-bold text-2xl flex items-center gap-3">
                                    <Calendar className="w-6 h-6" />
                                    Form Reservasi
                                </h3>
                                <p className="text-orange-100 text-sm mt-1">
                                    {facility.name} • {formatDisplayDate(selectedDate)}
                                </p>
                            </div>
                            <BookingForm
                                facilityId={facility.facility_id}
                                facilityName={facility.name}
                                selectedDate={selectedDate}
                                existingBookings={bookingsForDate}
                                onSuccess={() => {
                                    setSelectedDate(selectedDate);
                                }}
                                className="border-0 shadow-none rounded-none"
                            />
                        </div>
                    ) : !isMaintenanceActive && (
                        <div className="bg-white rounded-2xl p-12 shadow-xl shadow-gray-200/50 border border-gray-100 text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Calendar className="w-12 h-12 text-orange-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Pilih Tanggal untuk Reservasi
                            </h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Silakan pilih tanggal pada kalender di atas untuk melihat ketersediaan waktu dan melakukan reservasi fasilitas ini.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div >
    );
}
