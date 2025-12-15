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
    const [participants, setParticipants] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (id && session?.accessToken) {
            fetchReservation();
        }
    }, [id, session]);

    const fetchReservation = async () => {
        try {
            const res = await api.get(`/reservations/${id}`);
            const resData = res.data;
            setReservation(resData);

            // Pre-populate form fields
            setDate(resData.date);
            setStartTime(resData.startTime);
            setEndTime(resData.endTime);
            setPurpose(resData.purpose);
            setParticipants(resData.participants.toString());
        } catch (error) {
            toast.error("Failed to load reservation");
            router.push("/reservations");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);

        try {
            await api.put(
                `/reservations/${id}`,
                {
                    date,
                    startTime,
                    endTime,
                    purpose,
                    participants: parseInt(participants)
                }
            );

            toast.success("Reservation updated successfully");
            router.push("/reservations");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update reservation");
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
                <p>Loading reservation...</p>
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
    if (reservation.status !== 'pending') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Cannot Edit Reservation</h2>
                    <p className="text-gray-600 mb-6">This reservation cannot be modified. Only pending reservations can be edited.</p>
                    <Link href="/reservations" className="text-blue-600 hover:text-blue-800">← Back to Reservations</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Reservation</h1>

                    <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
                        <h2 className="text-lg font-semibold text-blue-900 mb-2">Reservation Details</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-700">Facility:</span> {reservation.facilityName}
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Status:</span>
                                <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Participants</label>
                            <input
                                type="number"
                                value={participants}
                                onChange={(e) => setParticipants(e.target.value)}
                                min="1"
                                max={reservation.facilityCapacity}
                                required
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                            <textarea
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                required
                                rows={3}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            ></textarea>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={updating}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {updating ? "Updating..." : "Update Reservation"}
                            </button>
                            <Link href="/reservations">
                                <button
                                    type="button"
                                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}