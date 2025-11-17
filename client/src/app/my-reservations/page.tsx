/*
 * =======================================================
 * FILE: client/src/app/my-reservations/page.tsx (USING COMPONENTS)
 * =======================================================
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Layout from '@/components/Layout';

// Tipe data untuk item di dalam reservasi
interface ReservationItem {
  item_id: number;
  start_datetime: string;
  end_datetime: string;
  item_name: string; // (Nama fasilitas/alat)
}

// Tipe data untuk satu reservasi lengkap
interface Reservation {
  reservation_id: number;
  purpose: string;
  attendees: number;
  created_at: string;
  is_canceled: boolean;
  status_name: string; // (e.g., 'PENDING', 'APPROVED')
  items: ReservationItem[] | null;
}

export default function MyReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const token = Cookies.get('token');

  // --- FUNGSI BATALKAN RESERVASI ---
  const handleCancel = async (reservationId: number, purpose: string) => {
    if (!confirm(`Apakah Anda yakin ingin membatalkan reservasi untuk tujuan: "${purpose}"?`)) {
      return;
    }

    setCancellingId(reservationId);
    setError('');

    try {
      if (!token) {
        router.push('/login');
        return;
      }

      await axios.put(
        `http://localhost:5000/api/reservations/cancel/${reservationId}`,
        {}, // Tidak perlu body
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update UI secara instan (Optimistic Update)
      setReservations((prevReservations) =>
        prevReservations.map((res) =>
          res.reservation_id === reservationId
            ? { ...res, status_name: 'CANCELED', is_canceled: true } // Ubah status & flag
            : res
        )
      );

      setSuccess(`Reservasi berhasil dibatalkan!`);
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Gagal membatalkan reservasi.');
      } else {
        setError('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setCancellingId(null);
    }
  };

  // Ambil data saat halaman dimuat
  useEffect(() => {
    const fetchMyReservations = async () => {
      setIsLoading(true);
      setError('');

      const token = Cookies.get('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/reservations/my-history', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setReservations(response.data);
      } catch (err) {
        console.error(err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setError('Sesi Anda habis. Silakan login kembali.');
          router.push('/login');
        } else {
          setError('Gagal mengambil riwayat reservasi.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyReservations();
  }, [router]);

  // Helper function untuk format tanggal
  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper untuk styling status
  const getStatusClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return 'badge-success';
      case 'REJECTED':
      case 'CANCELED':
        return 'badge-danger';
      case 'PENDING':
        return 'badge-warning';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // === Tampilan Halaman ===
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

        <h1 className="text-4xl font-bold mb-6 text-gray-800">Riwayat Reservasi Saya</h1>

        {error && (
          <p className="text-red-500 text-lg mb-4 bg-red-50 p-2 rounded border border-red-200">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-500 text-lg mb-4 bg-green-50 p-2 rounded border border-green-200">
            {success}
          </p>
        )}

        {isLoading ? (
          <p className="text-blue-500">Mengambil data...</p>
        ) : reservations.length === 0 ? (
          <p className="text-gray-500 text-lg">Anda belum pernah melakukan reservasi.</p>
        ) : (
          // Daftar Reservasi
          <div className="space-y-6">
            {reservations.map((res) => (
              <div key={res.reservation_id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">{res.purpose}</h2>
                    <p className="text-gray-500">Dibuat pada: {formatDateTime(res.created_at)}</p>
                  </div>
                  <span className={getStatusClass(res.status_name)}>{res.status_name}</span>
                </div>

                <div className="mb-4">
                  <p className="text-gray-600">Jumlah Peserta: {res.attendees} orang</p>
                  {res.is_canceled && <p className="text-red-500 font-bold">DIBATALKAN</p>}
                </div>

                {/* Daftar Item */}
                <h3 className="text-lg font-semibold mb-2 text-blue-600">Item yang Dipesan:</h3>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  {res.items &&
                    res.items.map((item) => (
                      <li key={item.item_id} className="text-gray-600">
                        <span className="font-semibold text-gray-800">{item.item_name}</span>
                        <br />
                        <span className="text-sm text-gray-500">
                          {formatDateTime(item.start_datetime)}
                        </span>
                        <span className="text-sm text-gray-500">{' -> '}</span>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(item.end_datetime)}
                        </span>
                      </li>
                    ))}
                </ul>

                {/* --- Tombol Batal --- */}
                {res.status_name === 'PENDING' && !res.is_canceled && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={() => handleCancel(res.reservation_id, res.purpose)}
                      disabled={cancellingId === res.reservation_id}
                      className="btn-danger"
                    >
                      {cancellingId === res.reservation_id
                        ? 'Membatalkan...'
                        : 'Batalkan Reservasi'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
