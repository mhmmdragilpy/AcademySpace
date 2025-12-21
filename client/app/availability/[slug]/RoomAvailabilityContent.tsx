"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Star, StarHalf } from 'lucide-react';
import api from '@/lib/api';
import { useFacilityRatingStats, useFacilityRatings } from '@/hooks/useRatings';

// Define the booking interface
interface Booking {
  id: number;
  startTime: string;
  endTime: string;
  bookedBy: string;
  purpose: string;
}

interface RoomDetails {
  id: number;
  name: string;
  building: string;
  capacity: number;
  description: string;
}

export function RoomAvailabilityContent({ roomDetails }: { roomDetails: RoomDetails }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [bookingsForDate, setBookingsForDate] = useState<Record<string, Booking[]>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [participants, setParticipants] = useState<number | string>(1);
  const [proposalUrl, setProposalUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: ratingStats } = useFacilityRatingStats(roomDetails.id);
  const { data: ratings } = useFacilityRatings(roomDetails.id);

  // Define time slots (from 05:00 to 21:00, every hour)
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 5; // Start at 5
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  useEffect(() => {
    if (selectedDate && roomDetails.id) {
      fetchBookings(selectedDate);
    }
  }, [selectedDate, roomDetails.id]);

  const fetchBookings = async (date: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/facilities/${roomDetails.id}/reservations?date=${date}`);

      // The backend returns an array of objects
      const data = (Array.isArray(res) ? res : (res as any).data) || [];

      const bookingsMap: Record<string, Booking[]> = {};

      timeSlots.forEach(slot => {
        const slotBookings = data.filter((b: any) => {
          const bStart = b.startTime.substring(0, 5); // Ensure HH:mm
          const bEnd = b.endTime.substring(0, 5);
          return slot >= bStart && slot < bEnd;
        });
        if (slotBookings.length > 0) {
          bookingsMap[slot] = slotBookings;
        }
      });

      setBookingsForDate(bookingsMap);

    } catch (error) {
      console.error("Failed to fetch bookings", error);
      toast.error("Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if user is logged in
    if (!session) {
      toast.error("Please login to upload files");
      router.push("/login");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      // Don't set Content-Type header - axios will set it automatically with proper boundary
      const res = await api.post("/upload", formData);

      const uploadedUrl = (res as any).url;
      setProposalUrl(uploadedUrl);
      toast.success("File uploaded successfully");
    } catch (error: any) {
      console.error("Upload failed", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
      } else {
        toast.error("Failed to upload file");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Please login to book a room");
      router.push("/login");
      return;
    }

    if (!selectedDate || !startTime || !endTime || !purpose) {
      toast.error("Please fill in all fields");
      return;
    }

    if (startTime >= endTime) {
      toast.error("Start time must be before end time");
      return;
    }

    if (Number(participants) <= 0) {
      toast.error("Participants must be greater than 0");
      return;
    }

    // Modern Date Validation (H-3 for Regular, Alert for Big Events)
    const bookingDate = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = bookingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 3) {
      toast.error("Pengajuan reguler minimal H-3. Mohon pilih tanggal lain.");
      return;
    }

    if (purpose.length < 5) {
      toast.error("Purpose must be at least 5 characters");
      return;
    }

    // Client-side conflict check
    const hasConflict = timeSlots.some(slot => {
      if (slot >= startTime && slot < endTime) {
        return bookingsForDate[slot] && bookingsForDate[slot].length > 0;
      }
      return false;
    });

    if (hasConflict) {
      toast.error("Waktu yang dipilih sudah terisi! Silakan pilih waktu lain.");
      return;
    }

    try {
      setSubmitting(true);
      const bookingData = {
        facilityId: roomDetails.id,
        date: selectedDate,
        startTime,
        endTime,
        purpose,
        participants: Number(participants),
        proposal_url: proposalUrl
      };

      await api.post("/reservations", bookingData);
      toast.success("Reservation submitted successfully!");

      // Reset form and refresh bookings
      setPurpose("");
      setStartTime("");
      setEndTime("");
      setProposalUrl("");
      fetchBookings(selectedDate);

      // Optionally redirect to my-reservations
      setTimeout(() => router.push("/reservations"), 1500);

    } catch (error: any) {
      console.error("Booking failed", error);
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.message;

      if (statusCode === 409) {
        toast.error("Slot waktu ini sudah dipesan! Silakan pilih waktu lain yang tersedia.");
        // Refresh bookings to show updated availability
        fetchBookings(selectedDate);
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

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay(); // 0 is Sunday

  // Helper to format date for API (YYYY-MM-DD)
  const formatDateForApi = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${month}-${d}`;
  }

  const checkAvailability = (slot: string) => {
    return !bookingsForDate[slot];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cek Ketersediaan Ruangan</h1>
          <p className="mt-2 text-lg text-gray-600">{roomDetails.name} - {roomDetails.building}</p>
          {ratingStats && ratingStats.totalRatings > 0 && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="flex items-center text-yellow-500">
                <span className="font-bold text-gray-900 mr-1">{ratingStats.averageRating.toFixed(1)}</span>
                <Star className="w-5 h-5 fill-current" />
              </div>
              <span className="text-sm text-gray-500">({ratingStats.totalRatings} ulasan)</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900">Nama Ruangan</h3>
              <p className="text-gray-700">{roomDetails.name}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900">Gedung</h3>
              <p className="text-gray-700">{roomDetails.building}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900">Kapasitas</h3>
              <p className="text-gray-700">{roomDetails.capacity} orang</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Deskripsi</h3>
            <p className="text-gray-700">{roomDetails.description}</p>
          </div>

          {ratings && ratings.length > 0 && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ulasan Pengguna</h3>
              <div className="space-y-4">
                {ratings.map((rating, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900">{rating.user_name}</div>
                        <div className="flex text-yellow-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < rating.rating ? "fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {rating.review && (
                      <p className="text-gray-600 text-sm">{rating.review}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Calendar Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Kalender Ketersediaan</h2>

          {/* Calendar Navigation */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigateMonth(-1)}
              className="bg-[#07294B] text-white p-2 rounded-lg hover:bg-[#051a30] transition-colors">
              &lt; Prev
            </button>
            <h3 className="text-lg font-semibold text-gray-900">
              {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => navigateMonth(1)}
              className="bg-[#07294B] text-white p-2 rounded-lg hover:bg-[#051a30] transition-colors">
              Next &gt;
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
              <div key={day} className="text-center font-medium text-gray-700 py-2">
                {day}
              </div>
            ))}

            {/* Empty slots for start of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="py-2"></div>
            ))}

            {daysInMonth.map((day) => {
              const dateStr = formatDateForApi(day);
              const isSelected = selectedDate === dateStr;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`text-center py-2 border rounded-lg hover:bg-blue-50 transition-colors ${isSelected ? 'bg-primary-orange text-white border-primary-orange hover:bg-orange-600' : 'bg-white border-gray-200'
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Selected Date Info */}
          {selectedDate && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
              <p className="font-medium">Tanggal terpilih: {selectedDate}</p>
            </div>
          )}
        </div>

        {/* Time Slots Section - Only show when a date is selected */}
        {selectedDate && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Ketersediaan Jam pada Tanggal {selectedDate}
            </h2>

            {loading ? (
              <p>Loading availability...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {timeSlots.map((time) => {
                  const isAvailable = checkAvailability(time);
                  const bookingInfo = bookingsForDate[time]?.[0];

                  return (
                    <div
                      key={time}
                      className={`p-3 rounded-lg border text-center ${isAvailable
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                    >
                      <div className="font-bold">{time}</div>
                      <div className="text-xs mt-1">
                        {isAvailable ? "Tersedia" : "Terpesan"}
                      </div>
                      {!isAvailable && bookingInfo && (
                        <div className="text-xs mt-1 truncate" title={bookingInfo.purpose}>
                          By: {bookingInfo.bookedBy}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Reservation Form - Show when date is selected */}
        {selectedDate && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-bold text-[#07294B] mb-6 flex items-center">
              <span className="bg-[#FA7436] w-2 h-8 mr-3 rounded-full"></span>
              Ajukan Pemesanan Digital
            </h3>

            {/* Modern Guide Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 mb-8">
              <h4 className="font-semibold text-[#07294B] mb-3 flex items-center">
                ✨ Smart Booking Process
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="bg-white p-2 rounded-full shadow-sm text-[#FA7436] font-bold">1</div>
                  <div>
                    <p className="font-medium text-gray-900">Upload Proposal</p>
                    <p className="text-gray-500">Dukungan file digital (PDF/Img)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white p-2 rounded-full shadow-sm text-[#FA7436] font-bold">2</div>
                  <div>
                    <p className="font-medium text-gray-900">Smart Approval</p>
                    <p className="text-gray-500">Verifikasi H-3 (Reguler) / H-7 (Event)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white p-2 rounded-full shadow-sm text-[#FA7436] font-bold">3</div>
                  <div>
                    <p className="font-medium text-gray-900">Get E-Permit</p>
                    <p className="text-gray-500">Izin digital otomatis terbit</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleBooking}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
                    value={selectedDate}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Peserta</label>
                  <input
                    type="number"
                    min="1"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Proposal / Rundown (Max 5MB)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm max-w-md"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
                  {proposalUrl && <span className="text-sm text-green-600 font-medium">Uploaded ✓</span>}
                </div>
                <p className="text-xs text-gray-500 mt-1">Format: PDF, DOC, JPG, PNG.</p>
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
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="w-full bg-[#FA7436] text-white font-medium py-2 px-4 rounded-lg hover:bg-[#e5672f] transition-colors disabled:opacity-50">
                  {submitting ? "Processing..." : "Ajukan Pemesanan"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}