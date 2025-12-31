// USE CASE #7: Mengajukan Reservasi - [View]
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle, Calendar, Clock, Users, FileText } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface BookingData {
    facilityId: number;
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
    participants: number;
    proposal_url?: string;
}

export interface ExistingReservation {
    reservation_id: number;
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
    participants?: number;
    attendees?: number;
    proposal_url?: string;
}

interface BookingFormProps {
    facilityId: number;
    facilityName?: string;
    selectedDate: string;
    existingBookings?: Record<string, { startTime: string; endTime: string }[]>;
    onSubmit?: (data: BookingData) => Promise<void>;
    onSuccess?: () => void;
    editMode?: boolean;
    existingData?: ExistingReservation;
    className?: string;
}

// Generate time slots from 05:00 to 21:00
const generateTimeSlots = () => {
    return Array.from({ length: 17 }, (_, i) => {
        const hour = i + 5;
        return `${hour.toString().padStart(2, "0")}:00`;
    });
};

export function BookingForm({
    facilityId,
    facilityName,
    selectedDate,
    existingBookings = {},
    onSubmit,
    onSuccess,
    editMode = false,
    existingData,
    className = "",
}: BookingFormProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const timeSlots = generateTimeSlots();

    // Form State
    const [startTime, setStartTime] = useState(existingData?.startTime || "");
    const [endTime, setEndTime] = useState(existingData?.endTime || "");
    const [purpose, setPurpose] = useState(existingData?.purpose || "");
    const [participants, setParticipants] = useState<number | string>(
        existingData?.participants || existingData?.attendees || 1
    );
    const [proposalUrl, setProposalUrl] = useState(existingData?.proposal_url || "");
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Update form when existingData changes (for edit mode)
    useEffect(() => {
        if (existingData) {
            setStartTime(existingData.startTime || "");
            setEndTime(existingData.endTime || "");
            setPurpose(existingData.purpose || "");
            setParticipants(existingData.participants || existingData.attendees || 1);
            setProposalUrl(existingData.proposal_url || "");
        }
    }, [existingData]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!session) {
            toast.error("Please login to upload files");
            router.push("/LoginPage");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);

            const res = await api.post("/upload", formData);
            const uploadedUrl = (res as any).url;
            setProposalUrl(uploadedUrl);
            toast.success("File uploaded successfully");
        } catch (error: any) {
            console.error("Upload failed", error);
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                router.push("/LoginPage");
            } else {
                toast.error("Failed to upload file");
            }
        } finally {
            setUploading(false);
        }
    };

    const validateForm = (): boolean => {
        if (!session) {
            toast.error("Please login to book a room");
            router.push("/LoginPage");
            return false;
        }

        if (!selectedDate || !startTime || !endTime || !purpose) {
            toast.error("Please fill in all required fields");
            return false;
        }

        if (startTime >= endTime) {
            toast.error("Start time must be before end time");
            return false;
        }

        if (Number(participants) <= 0) {
            toast.error("Participants must be greater than 0");
            return false;
        }

        // Date validation (H-3 minimum for regular bookings)
        if (!editMode) {
            const bookingDate = new Date(selectedDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffTime = bookingDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 3) {
                toast.error("Pengajuan reguler minimal H-3. Mohon pilih tanggal lain.");
                return false;
            }
        }

        if (purpose.length < 5) {
            toast.error("Purpose must be at least 5 characters");
            return false;
        }

        // Client-side conflict check (skip for edit mode on same reservation)
        if (!editMode) {
            const hasConflict = timeSlots.some((slot) => {
                if (slot >= startTime && slot < endTime) {
                    return existingBookings[slot] && existingBookings[slot].length > 0;
                }
                return false;
            });

            if (hasConflict) {
                toast.error("Waktu yang dipilih sudah terisi! Silakan pilih waktu lain.");
                return false;
            }
        }

        return true;
    };

    // [USE CASE #7] Mengajukan Reservasi - Handle Submit Form Reservasi
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const bookingData: BookingData = {
            facilityId,
            date: selectedDate,
            startTime,
            endTime,
            purpose,
            participants: Number(participants),
            proposal_url: proposalUrl || undefined,
        };

        try {
            setSubmitting(true);

            if (onSubmit) {
                await onSubmit(bookingData);
            } else {
                // Default submission logic
                if (editMode && existingData?.reservation_id) {
                    await api.put(`/reservations/${existingData.reservation_id}`, bookingData);
                    toast.success("Reservation updated successfully!");
                } else {
                    await api.post("/reservations", bookingData);
                    toast.success("Reservation submitted successfully!");
                }
            }

            // Reset form (only for new bookings)
            if (!editMode) {
                setPurpose("");
                setStartTime("");
                setEndTime("");
                setProposalUrl("");
            }

            if (onSuccess) {
                onSuccess();
            } else {
                // Default redirect
                setTimeout(() => router.push("/MyReservationsPage"), 1500);
            }
        } catch (error: any) {
            console.error("Booking failed", error);
            const statusCode = error.response?.status;
            const errorMessage = error.response?.data?.message;

            if (statusCode === 409) {
                toast.error("Slot waktu ini sudah dipesan! Silakan pilih waktu lain.");
            } else if (Array.isArray(errorMessage)) {
                errorMessage.forEach((err: any) => {
                    toast.error(`${err.path}: ${err.message}`);
                });
            } else {
                toast.error(errorMessage || "Booking failed");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const isSlotAvailable = (slot: string) => !existingBookings[slot];

    return (
        <Card className={`animate-in fade-in slide-in-from-bottom-4 duration-500 w-full ${className}`}>
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#07294B] flex items-center">
                    <span className="bg-[#FA7436] w-2 h-8 mr-3 rounded-full"></span>
                    {editMode ? "Edit Pemesanan" : "Ajukan Pemesanan Digital"}
                </CardTitle>
            </CardHeader>

            <CardContent>
                {/* Smart Booking Guide */}
                {!editMode && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 mb-8">
                        <h4 className="font-semibold text-[#07294B] mb-3 flex items-center">
                            ✨ Smart Booking Process
                        </h4>
                        <div className="flex flex-col md:flex-row gap-4 text-sm">
                            <div className="flex items-start gap-3 flex-1">
                                <div className="bg-white p-2 rounded-full shadow-sm text-[#FA7436] font-bold shrink-0">
                                    1
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Upload Proposal</p>
                                    <p className="text-gray-500">Dukungan file digital (PDF/Img)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 flex-1">
                                <div className="bg-white p-2 rounded-full shadow-sm text-[#FA7436] font-bold shrink-0">
                                    2
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Smart Approval</p>
                                    <p className="text-gray-500">Verifikasi H-3 (Reguler) / H-7 (Event)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 flex-1">
                                <div className="bg-white p-2 rounded-full shadow-sm text-[#FA7436] font-bold shrink-0">
                                    3
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Get E-Permit</p>
                                    <p className="text-gray-500">Izin digital otomatis terbit</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col space-y-6 w-full">
                    {/* Date Field */}
                    <div className="space-y-2 w-full">
                        <Label htmlFor="date" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#FA7436]" />
                            Tanggal
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={selectedDate}
                            disabled
                            className="bg-gray-100 w-full"
                        />
                    </div>

                    {/* Participants Field */}
                    <div className="space-y-2 w-full">
                        <Label htmlFor="participants" className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#FA7436]" />
                            Jumlah Peserta
                        </Label>
                        <Input
                            id="participants"
                            type="number"
                            min="1"
                            value={participants}
                            onChange={(e) =>
                                setParticipants(e.target.value === "" ? "" : parseInt(e.target.value))
                            }
                            required
                            className="w-full"
                        />
                    </div>

                    {/* Start Time Field */}
                    <div className="space-y-2 w-full">
                        <Label htmlFor="startTime" className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#FA7436]" />
                            Waktu Mulai
                        </Label>
                        <Select value={startTime} onValueChange={setStartTime}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih waktu mulai" />
                            </SelectTrigger>
                            <SelectContent>
                                {timeSlots.map((time) => (
                                    <SelectItem
                                        key={`start-${time}`}
                                        value={time}
                                        disabled={!isSlotAvailable(time)}
                                    >
                                        {time} {!isSlotAvailable(time) && "(Terpesan)"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* End Time Field */}
                    <div className="space-y-2 w-full">
                        <Label htmlFor="endTime" className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#FA7436]" />
                            Waktu Selesai
                        </Label>
                        <Select value={endTime} onValueChange={setEndTime}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih waktu selesai" />
                            </SelectTrigger>
                            <SelectContent>
                                {timeSlots.map((time) => (
                                    <SelectItem
                                        key={`end-${time}`}
                                        value={time}
                                        disabled={time <= startTime}
                                    >
                                        {time}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* File Upload Field */}
                    <div className="space-y-2 w-full">
                        <Label htmlFor="proposal" className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#FA7436]" />
                            Upload Proposal / Rundown (Max 5MB)
                        </Label>
                        <div className="flex flex-col gap-2 w-full">
                            <Input
                                id="proposal"
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="w-full"
                            />
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">Format: PDF, DOC, JPG, PNG.</p>
                                {uploading && (
                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Uploading...
                                    </span>
                                )}
                                {proposalUrl && !uploading && (
                                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4" />
                                        Uploaded
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Purpose Field */}
                    <div className="space-y-2 w-full">
                        <Label htmlFor="purpose">Keperluan</Label>
                        <Textarea
                            id="purpose"
                            rows={4}
                            placeholder="Tuliskan keperluan penggunaan ruangan..."
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            required
                            className="w-full resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={submitting || uploading}
                        className="w-full bg-[#FA7436] hover:bg-[#e5672f] text-white font-medium py-3 mt-4"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : editMode ? (
                            "Update Pemesanan"
                        ) : (
                            "Ajukan Pemesanan"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default BookingForm;
