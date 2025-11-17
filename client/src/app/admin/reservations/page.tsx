/*
 * =============================================================
 * FILE: client/src/app/admin/reservations/page.tsx (USING COMPONENTS)
 * =============================================================
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
  item_name: string;
}

// Tipe data untuk satu reservasi (versi Admin)
interface AdminReservation {
  reservation_id: number;
  purpose: string;
  attendees: number;
  created_at: string;
  is_canceled: boolean;
  status_name: string; // (e.g., 'PENDING', 'APPROVED')
  requester_name: string; // (Nama user)
  requester_email: string; // (Email user)
  items: ReservationItem[] | null; // Array dari item
}

// Tipe Aksi Status
type StatusAction = 'APPROVED' | 'REJECTED';

export default function AdminReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const token = Cookies.get('token');

  // Menangani klik tombol Approve / Reject
  const handleUpdateStatus = async (reservationId: number, action: StatusAction) => {
    setSubmittingId(reservationId);
    setError('');
    setSuccess('');

    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/admin/reservations/status/${reservationId}`,
        {
          status: action,
          comment:
            action === 'APPROVED' ? 'Reservasi Anda telah disetujui.' : 'Reservasi Anda ditolak.',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update data di frontend TANPA refresh halaman
      setReservations((prevReservations) =>
        prevReservations.map((res) =>
          res.reservation_id === reservationId
            ? { ...res, status_name: action } // Ubah status_name-nya
            : res
        )
      );

      setSuccess(
        `Reservasi #${reservationId} berhasil di-${action === 'APPROVED' ? 'setujui' : 'tolak'}!`
      );
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response) {
        setError(`Gagal update reservasi #${reservationId}: ${err.response.data.message}`);
      } else {
        setError(`Gagal update reservasi #${reservationId}.`);
      }
    } finally {
      setSubmittingId(null);
    }
  };

  // Fungsi untuk mengambil semua data
  const fetchAllReservations = async () => {
    setIsLoading(true);
    setError('');

    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await axios.get('http://localhost:5000/api/admin/reservations/all', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReservations(response.data); // Simpan data ke state
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          setError('Akses ditolak. Anda bukan admin.');
          // Redirect ke dashboard user biasa
          router.push('/dashboard');
        } else {
          setError('Gagal mengambil riwayat reservasi.');
        }
      } else {
        setError('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Ambil data saat halaman dimuat
  useEffect(() => {
    fetchAllReservations();
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
        <header className="mb-8 flex justify-between items-center">
          <Link href="/admin/dashboard" className="text-blue-600 hover:underline flex items-center">
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
            Kembali ke Dashboard Admin
          </Link>

          <div className="flex gap-4">
            <Link href="/admin/facilities/manage" className="btn-primary flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Kelola Fasilitas
            </Link>
            <Link
              href="/admin/equipment/manage"
              className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition duration-300 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                  clipRule="evenodd"
                />
              </svg>
              Kelola Peralatan
            </Link>
            <Link
              href="/admin/facility-types/manage"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition duration-300 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              Kelola Tipe
            </Link>
            <Link href="/admin/facilities/create" className="btn-success flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Tambah Fasilitas
            </Link>
          </div>
        </header>

        <h1 className="text-4xl font-bold mb-4 text-gray-800">Admin Panel - Semua Reservasi</h1>
        <p className="text-gray-600 mb-6">Kelola permintaan reservasi dan fasilitas.</p>

        {/* Tampilkan error/success global jika ada */}
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
          <p className="text-gray-500 text-lg">Belum ada reservasi yang masuk.</p>
        ) : (
          // Daftar Reservasi (Tabel)
          <div className="table-container">
            <table className="min-w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Requester</th>
                  <th className="table-header-cell">Tujuan</th>
                  <th className="table-header-cell">Item & Waktu</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Aksi</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {reservations.map((res) => (
                  <tr key={res.reservation_id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{res.requester_name}</div>
                      <div className="text-sm text-gray-500">{res.requester_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{res.purpose}</div>
                      <div className="text-sm text-gray-500">{res.attendees} orang</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {res.items &&
                        res.items.map((item) => (
                          <div key={item.item_id} className="text-sm text-gray-500 mb-1">
                            <span className="font-semibold text-gray-900">{item.item_name}</span>
                            <br />
                            {formatDateTime(item.start_datetime)}
                          </div>
                        ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusClass(res.status_name)}>{res.status_name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {/* Tampilkan tombol HANYA jika status masih 'PENDING' */}
                      {res.status_name === 'PENDING' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateStatus(res.reservation_id, 'APPROVED')}
                            disabled={submittingId === res.reservation_id}
                            className="text-green-600 hover:text-green-800 flex items-center disabled:text-gray-400"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {submittingId === res.reservation_id ? 'Loading...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(res.reservation_id, 'REJECTED')}
                            disabled={submittingId === res.reservation_id}
                            className="text-red-600 hover:text-red-800 flex items-center disabled:text-gray-400"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 01-1.414-1.414L10 8.586l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 01-1.414-1.414L10 8.586l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 01-1.414-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {submittingId === res.reservation_id ? 'Loading...' : 'Reject'}
                          </button>
                        </div>
                      ) : (
                        // Jika sudah di-approve/reject, tampilkan strip
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
