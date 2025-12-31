// USE CASE #8: Mengedit atau Membatalkan Reservasi - [View]
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { BookingForm, ExistingReservation } from "@/components/BookingForm";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import {
    ArrowLeft,
    Calendar,
    Building2,
    Users,
    Clock,
    AlertCircle,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface ReservationDetail {
    reservation_id: number;
    facilityId: number;
    facilityName: string;
    facilityCapacity?: number;
    building_name?: string;
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
    participants?: number;
    attendees?: number;
    status: string;
    proposal_url?: string;
}

export default function EditReservationPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [reservation, setReservation] = useState<ReservationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [existingBookings, setExistingBookings] = useState<Record<string, any[]>>({});

    useEffect(() => {
        const fetchReservation = async () => {
            if (!id || !session?.accessToken) return;

            try {
                const res = await api.get(`/reservations/${id}`);
                const resData = res as any;
                setReservation(resData);

                // Fetch existing bookings for the date (to show conflicts)
                if (resData.facilityId && resData.date) {
                    try {
                        const bookingsRes = await api.get(
                            `/facilities/${resData.facilityId}/reservations?date=${resData.date}`
                        );
                        const bookingsData = (Array.isArray(bookingsRes) ? bookingsRes : (bookingsRes as any).data) || [];

                        // Filter out current reservation from conflicts
                        const filteredBookings = bookingsData.filter(
                            (b: any) => b.id !== resData.reservation_id && b.reservation_id !== resData.reservation_id
                        );

                        // Map to time slots
                        const timeSlots = Array.from({ length: 17 }, (_, i) => {
                            const hour = i + 5;
                            return `${hour.toString().padStart(2, "0")}:00`;
                        });

                        const bookingsMap: Record<string, any[]> = {};
                        timeSlots.forEach((slot) => {
                            const slotBookings = filteredBookings.filter((b: any) => {
                                const bStart = b.startTime?.substring(0, 5);
                                const bEnd = b.endTime?.substring(0, 5);
                                return slot >= bStart && slot < bEnd;
                            });
                            if (slotBookings.length > 0) {
                                bookingsMap[slot] = slotBookings;
                            }
                        });

                        setExistingBookings(bookingsMap);
                    } catch (err) {
                        console.error("Failed to fetch existing bookings:", err);
                    }
                }
            } catch (error) {
                console.error('Error fetching reservation:', error);
                toast.error("Failed to load reservation");
                router.push("/MyReservationsPage");
            } finally {
                setLoading(false);
            }
        };

        fetchReservation();
    }, [id, session?.accessToken, router]);

    if (!session) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center">
                <div className="text-center px-4">
                    <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-10 h-10 text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
                    <p className="text-gray-500 mb-6">Please login to edit this reservation.</p>
                    <Button asChild className="bg-gradient-to-r from-orange-500 to-orange-600">
                        <Link href="/LoginPage">Login</Link>
                    </Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
                <Navigation />
                <div className="max-w-4xl mx-auto px-4 py-12 mt-16">
                    <Skeleton className="h-10 w-48 mb-6" />
                    <Skeleton className="h-32 w-full rounded-2xl mb-6" />
                    <Skeleton className="h-[500px] w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!reservation) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center">
                <div className="text-center px-4">
                    <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Reservasi Tidak Ditemukan</h2>
                    <p className="text-gray-500 mb-6">Reservasi yang Anda cari tidak dapat ditemukan.</p>
                    <Button asChild variant="outline">
                        <Link href="/MyReservationsPage">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke Reservasi
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Only allow editing if status is pending
    if (reservation.status?.toUpperCase() !== 'PENDING') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
                <Navigation />
                <div className="max-w-2xl mx-auto px-4 py-24">
                    <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 text-center">
                        <div className="w-20 h-20 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Tidak Dapat Mengedit</h2>
                        <p className="text-gray-600 mb-6">
                            Reservasi dengan status <span className="font-semibold">{reservation.status}</span> tidak dapat dimodifikasi.
                            <br />
                            Hanya reservasi dengan status <span className="font-semibold text-yellow-600">PENDING</span> yang dapat diedit.
                        </p>
                        <Button asChild variant="outline">
                            <Link href="/MyReservationsPage">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali ke Reservasi Saya
                            </Link>
                        </Button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Prepare existing data for BookingForm
    const existingData: ExistingReservation = {
        reservation_id: reservation.reservation_id,
        date: reservation.date,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        purpose: reservation.purpose,
        participants: reservation.participants || reservation.attendees,
        proposal_url: reservation.proposal_url,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
            <Navigation />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16 pb-24">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                </Button>

                {/* Header */}
                <div className="text-center mb-8">
                    <Badge className="mb-4 bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
                        {reservation.status}
                    </Badge>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Edit Reservasi
                    </h1>
                    <p className="text-lg text-gray-600">
                        {reservation.facilityName}
                    </p>
                </div>

                {/* Facility Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-gray-100">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-blue-500/30">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-sm text-gray-500">Fasilitas</p>
                        <p className="font-bold text-gray-900 truncate">{reservation.facilityName}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-gray-100">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/30">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-sm text-gray-500">Tanggal</p>
                        <p className="font-bold text-gray-900">{reservation.date}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-gray-100">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-purple-500/30">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-sm text-gray-500">Waktu</p>
                        <p className="font-bold text-gray-900">{reservation.startTime} - {reservation.endTime}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-gray-100">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-orange-500/30">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-sm text-gray-500">Peserta</p>
                        <p className="font-bold text-gray-900">{reservation.participants || reservation.attendees || '-'}</p>
                    </div>
                </div>

                {/* Edit Form using BookingForm component */}
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                        <h3 className="font-bold text-2xl flex items-center gap-3">
                            <Calendar className="w-6 h-6" />
                            Edit Detail Reservasi
                        </h3>
                        <p className="text-orange-100 text-sm mt-1">
                            Ubah informasi reservasi Anda di bawah ini
                        </p>
                    </div>

                    <BookingForm
                        facilityId={reservation.facilityId}
                        facilityName={reservation.facilityName}
                        selectedDate={reservation.date}
                        existingBookings={existingBookings}
                        editMode={true}
                        existingData={existingData}
                        onSuccess={() => {
                            toast.success("Reservasi berhasil diperbarui!");
                            setTimeout(() => router.push("/MyReservationsPage"), 1500);
                        }}
                        className="border-0 shadow-none rounded-none"
                    />
                </div>
            </div>

            <Footer />
        </div>
    );
}