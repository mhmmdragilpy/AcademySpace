// USE CASE #8: Mengedit atau Membatalkan Reservasi - [View]
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

export default function EditReservationPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [reservation, setReservation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Form states
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [purpose, setPurpose] = useState("");
    const [participants, setParticipants] = useState<number | string>(1);
    const [updating, setUpdating] = useState(false);

    const [fetched, setFetched] = useState(false);

    // Define time slots (from 05:00 to 21:00, every hour)
    const timeSlots = Array.from({ length: 17 }, (_, i) => {
        const hour = i + 5;
        return `${hour.toString().padStart(2, '0')}:00`;
    });

    useEffect(() => {
        const fetchReservation = async () => {
            if (!id || !session?.accessToken || fetched) return;

            try {
                setFetched(true);
                const res = await api.get(`/reservations/${id}`);
                const resData = res as any;
                setReservation(resData);

                // Pre-populate form fields
                setDate(resData.date || '');
                setStartTime(resData.startTime || '');
                setEndTime(resData.endTime || '');
                setPurpose(resData.purpose || '');
                setParticipants(resData.participants || 1);
            } catch (error) {
                console.error('Error fetching reservation:', error);
                toast.error("Failed to load reservation");
                router.push("/MyReservationsPage");
            } finally {
                setLoading(false);
            }
        };

        fetchReservation();
    }, [id, session?.accessToken, fetched, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!date || !startTime || !endTime || !purpose) {
            toast.error("Mohon lengkapi semua field");
            return;
        }

        if (startTime >= endTime) {
            toast.error("Waktu mulai harus sebelum waktu selesai");
            return;
        }

        if (Number(participants) <= 0) {
            toast.error("Jumlah peserta harus lebih dari 0");
            return;
        }

        if (purpose.length < 5) {
            toast.error("Keperluan minimal 5 karakter");
            return;
        }

        setUpdating(true);

        try {
            await api.put(
                `/reservations/${id}`,
                {
                    date,
                    startTime,
                    endTime,
                    purpose,
                    participants: Number(participants)
                }
            );

            toast.success("Reservasi berhasil diperbarui!");
            setTimeout(() => router.push("/MyReservationsPage"), 1500);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message;
            if (error.response?.status === 409) {
                toast.error("Slot waktu ini sudah dipesan! Silakan pilih waktu lain.");
            } else {
                toast.error(errorMessage || "Gagal memperbarui reservasi");
            }
        } finally {
            setUpdating(false);
        }
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p>Please login to view this page.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA7436] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading reservation...</p>
                </div>
            </div>
        );
    }

    if (!reservation) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p>Reservation not found.</p>
            </div>
        );
    }

    // Only allow editing if status is pending
    if (reservation.status?.toUpperCase() !== 'PENDING') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 max-w-md text-center">
                    <h2 className="text-xl font-bold text-[#07294B] mb-4">Tidak Dapat Mengedit Reservasi</h2>
                    <p className="text-gray-600 mb-6">Reservasi ini tidak dapat dimodifikasi. Hanya reservasi dengan status PENDING yang dapat diedit.</p>
                    <Link href="/MyReservationsPage" className="text-[#FA7436] hover:text-[#e5672f] font-medium">← Kembali ke Reservasi</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Edit Reservasi</h1>
                    <p className="mt-2 text-lg text-gray-600">{reservation.facilityName}</p>
                </div>

                {/* Room Details Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900">Fasilitas</h3>
                            <p className="text-gray-700">{reservation.facilityName || '-'}</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900">Status</h3>
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                {reservation.status}
                            </span>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900">Kapasitas</h3>
                            <p className="text-gray-700">{reservation.facilityCapacity || '-'} orang</p>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="bg-white rounded-lg shadow-md p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-2xl font-bold text-[#07294B] mb-6 flex items-center">
                        <span className="bg-[#FA7436] w-2 h-8 mr-3 rounded-full"></span>
                        Edit Detail Pemesanan
                    </h3>

                    {/* Info Banner */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 mb-8">
                        <h4 className="font-semibold text-[#07294B] mb-3 flex items-center">
                            ✨ Informasi Edit
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-start gap-3">
                                <div className="bg-white p-2 rounded-full shadow-sm text-[#FA7436] font-bold">1</div>
                                <div>
                                    <p className="font-medium text-gray-900">Ubah Detail</p>
                                    <p className="text-gray-500">Perbarui tanggal, waktu, atau keperluan</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-white p-2 rounded-full shadow-sm text-[#FA7436] font-bold">2</div>
                                <div>
                                    <p className="font-medium text-gray-900">Cek Ketersediaan</p>
                                    <p className="text-gray-500">Sistem cek konflik waktu otomatis</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-white p-2 rounded-full shadow-sm text-[#FA7436] font-bold">3</div>
                                <div>
                                    <p className="font-medium text-gray-900">Simpan Perubahan</p>
                                    <p className="text-gray-500">Reservasi diperbarui otomatis</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Peserta</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={reservation.facilityCapacity || 999}
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                    value={participants}
                                    onChange={(e) => setParticipants(e.target.value === '' ? '' : parseInt(e.target.value))}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Mulai</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                >
                                    <option value="">Pilih waktu mulai</option>
                                    {timeSlots.map(time => (
                                        <option key={`start-${time}`} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Selesai</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                >
                                    <option value="">Pilih waktu selesai</option>
                                    {timeSlots.map(time => (
                                        <option key={`end-${time}`} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Keperluan</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-2"
                                rows={3}
                                placeholder="Tuliskan keperluan penggunaan ruangan..."
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                required
                            ></textarea>
                        </div>

                        <div className="mt-6 flex gap-4">
                            <button
                                type="submit"
                                disabled={updating}
                                className="flex-1 bg-[#FA7436] text-white font-medium py-3 px-4 rounded-lg hover:bg-[#e5672f] transition-colors disabled:opacity-50"
                            >
                                {updating ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                            <Link href="/MyReservationsPage" className="flex-1">
                                <button
                                    type="button"
                                    className="w-full bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Batal
                                </button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}