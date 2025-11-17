/*
 * ======================================================
 * FILE: client/src/app/facilities/[id]/page.tsx (USING COMPONENTS)
 * ======================================================
 */
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Layout from '@/components/Layout';

// Tipe data untuk form/response
interface FacilityData {
  facility_id: number;
  name: string;
  type_id: number;
  location: string;
  capacity: number;
  photo_url: string;
  layout_description?: string | null;
  type_name?: string;
}

// Tipe Slot Sibuk dari API
interface BusySlot {
  start_datetime: string;
  end_datetime: string;
}

export default function FacilityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // State untuk data
  const [facility, setFacility] = useState<FacilityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // --- State Form & Ketersediaan ---
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [purpose, setPurpose] = useState('');
  const [attendees, setAttendees] = useState(1);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [busySlots, setBusySlots] = useState<BusySlot[]>([]);

  const token = Cookies.get('token');

  // 1. Ambil Data Fasilitas (Awal)
  useEffect(() => {
    if (!id || !token) {
      router.push('/login');
      return;
    }

    const fetchFacilityDetail = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.get(`http://localhost:5000/api/facilities/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFacility(response.data);
        setAttendees(1);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          router.push('/login');
        } else {
          setError('Gagal memuat detail fasilitas.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchFacilityDetail();
  }, [id, router, token]);

  // 2. useEffect untuk mengambil slot yang SIBUK
  useEffect(() => {
    if (!facility?.facility_id || !startDate) return;

    const fetchBusySlots = async () => {
      setError('');
      const token = Cookies.get('token');
      if (!token) return;

      try {
        const formattedDate = startDate.toISOString().split('T')[0];

        const response = await axios.get(
          `http://localhost:5000/api/reservations/availability/${facility.facility_id}?date=${formattedDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setBusySlots(response.data); // Simpan slot sibuk
      } catch (err: unknown) {
        console.error('Gagal fetch ketersediaan:', err);
        setError('Gagal memuat ketersediaan jadwal. Silakan refresh.');
      }
    };

    fetchBusySlots();
  }, [startDate, facility?.facility_id, token]);

  // 3. Helper Function: Mengubah data API menjadi format Date untuk excludeTimes
  const excludedTimes = useMemo(() => {
    if (!busySlots || busySlots.length === 0) return [];

    const times: Date[] = [];

    busySlots.forEach((slot) => {
      const start = new Date(slot.start_datetime);
      const end = new Date(slot.end_datetime);

      let currentTime = new Date(start);

      while (currentTime < end) {
        const dateToExclude = new Date(startDate || new Date());

        dateToExclude.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0);

        times.push(dateToExclude);

        currentTime.setMinutes(currentTime.getMinutes() + 15);
      }
    });

    return times;
  }, [busySlots, startDate]);

  // --- FUNGSI SUBMIT RESERVASI ---
  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validasi Input Frontend
    if (
      !startDate ||
      !endDate ||
      !purpose ||
      endDate <= startDate ||
      attendees > (facility?.capacity || 1) ||
      attendees < 1
    ) {
      setFormError('Validasi gagal. Cek kembali waktu dan kapasitas.');
      return;
    }

    const reservationData = {
      purpose: purpose,
      attendees: attendees,
      items: [
        {
          facility_id: facility?.facility_id,
          start_datetime: startDate.toISOString(),
          end_datetime: endDate.toISOString(),
        },
      ],
    };

    try {
      const token = Cookies.get('token');
      await axios.post('http://localhost:5000/api/reservations', reservationData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFormSuccess('Reservasi berhasil dibuat! Menunggu approval admin.');
      setPurpose('');
      setStartDate(new Date());
      setEndDate(new Date());
      setAttendees(1);

      setStartDate(new Date()); // Memicu refresh ketersediaan
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 409) {
          setFormError('JADWAL BENTRÓK! Fasilitas sudah dipesan pada rentang waktu tersebut.');
        } else {
          setFormError(err.response.data.message || 'Gagal membuat reservasi.');
        }
      } else {
        setFormError('Terjadi kesalahan yang tidak diketahui.');
      }
    }
  };

  // === Tampilan Halaman (Render) ===
  if (isLoading || !facility) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading detail fasilitas...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-red-500 text-2xl mb-4">{error}</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Kembali ke Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  // Tampilan Sukses (Data Fasilitas Ditemukan)
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:underline flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Kembali ke Dashboard
          </Link>
        </header>

        {/* Hero Section Halaman Detail */}
        <div className="relative bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Background Image Sesuai Desain */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${facility.photo_url || 'https://images.unsplash.com/photo-1542435503-921c5831c0e0'})`,
            }}
          ></div>
          <div className="absolute inset-0 bg-black/50"></div> {/* Overlay gelap */}
          <div className="relative p-10">
            <span className="text-white font-semibold bg-blue-500 px-3 py-1 rounded-full text-sm">
              {facility.type_name}
            </span>
            <h1 className="text-5xl font-extrabold my-2 text-white">{facility.name}</h1>
            <p className="text-white text-lg mb-4">
              Lokasi: {facility.location} | Kapasitas: {facility.capacity} orang
            </p>
            {facility.layout_description && (
              <p className="text-gray-200 text-sm max-w-2xl">{facility.layout_description}</p>
            )}
          </div>
        </div>

        {/* --- GRID UTAMA: KALENDER DAN FORM --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* KOLOM 1: KALENDER & DATE PICKER */}
          <div className="lg:col-span-1 card">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Pilih Tanggal</h2>

            {/* Kalender */}
            <div className="flex justify-center mb-6">
              <DatePicker
                selected={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  setEndDate(date); // Reset end date saat tanggal berubah
                }}
                inline // Tampilkan kalender secara inline
                dateFormat="dd MMMM yyyy"
                minDate={new Date()} // Tidak bisa memilih masa lalu
                calendarClassName="bg-white border border-gray-200 rounded-lg custom-datepicker-calendar" // CSS class
              />
            </div>

            {/* Status Ketersediaan */}
            <p className="text-sm text-center text-gray-500 pt-4 border-t border-gray-200">
              Slot sibuk ditandai tidak dapat diklik.
            </p>
          </div>

          {/* KOLOM 2 & 3: SLOTS DAN FORM */}
          <div className="lg:col-span-2 card">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Tentukan Waktu & Tujuan</h2>

            {/* Input Waktu (Grid 2 kolom) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Waktu Mulai */}
              <div>
                <label className="form-label" htmlFor="startTime">
                  Waktu Mulai
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="HH:mm"
                  // --- KETERSEDIAAN INTEGRASI DI SINI ---
                  excludeTimes={excludedTimes}
                  // ----------------------------------------

                  // --- PERBAIKAN STYLING ---
                  customInput={<input className="form-input" id="startTime" />}
                  // --------------------------
                />
              </div>

              {/* Waktu Selesai */}
              <div>
                <label className="form-label" htmlFor="endTime">
                  Waktu Selesai
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="HH:mm"
                  // --- PERBAIKAN STYLING ---
                  customInput={<input className="form-input" id="endTime" />}
                  // --------------------------
                />
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200">
              <form onSubmit={handleSubmitReservation}>
                {/* Pesan Error/Sukses Form */}
                {formError && <p className="text-red-500 text-center mb-4">{formError}</p>}
                {formSuccess && <p className="text-green-500 text-center mb-4">{formSuccess}</p>}

                {/* Input Tujuan */}
                <div className="mb-4">
                  <label className="form-label" htmlFor="purpose">
                    Tujuan Reservasi
                  </label>
                  <input
                    type="text"
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                {/* Input Jumlah Peserta */}
                <div className="mb-6">
                  <label className="form-label" htmlFor="attendees">
                    Jumlah Peserta (Max: {facility.capacity})
                  </label>
                  <input
                    type="number"
                    id="attendees"
                    value={attendees}
                    onChange={(e) => setAttendees(parseInt(e.target.value))}
                    className="form-input"
                    required
                    min="1"
                    max={facility.capacity}
                  />
                </div>

                {/* Tombol Submit */}
                <button type="submit" className="btn-primary w-full">
                  Kirim Permintaan Reservasi
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
