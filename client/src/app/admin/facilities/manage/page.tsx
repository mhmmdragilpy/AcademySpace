/*
 * ===================================================================
 * FILE: client/src/app/admin/facilities/manage/page.tsx (USING COMPONENTS)
 * ===================================================================
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Layout from '@/components/Layout';

// Tipe data Fasilitas (sama seperti di Dashboard)
interface Facility {
  facility_id: number;
  name: string;
  type_name: string;
  location: string;
  capacity: number;
  is_active: boolean;
}

export default function AdminFacilityManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const token = Cookies.get('token');

  // Cek parameter URL untuk pesan sukses
  useEffect(() => {
    if (searchParams.get('updated') === 'true') {
      setSuccess('Fasilitas berhasil diperbarui!');
    }
  }, [searchParams]);

  // --- Fungsi Utama: Fetch Data Fasilitas ---
  const fetchFacilities = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (!token) {
        router.push('/login');
        return;
      }

      // Memanggil endpoint GET /api/facilities (yang dilindungi)
      const response = await axios.get('http://localhost:5000/api/facilities', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFacilities(response.data);
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          setError('Akses ditolak. Anda tidak diizinkan di sini.');
        } else {
          setError('Gagal memuat daftar fasilitas.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Ambil data saat halaman dimuat
  useEffect(() => {
    fetchFacilities();
  }, [router, token]);

  // --- FUNGSI BARU: Handle Delete Fasilitas ---
  const handleDelete = async (facilityId: number, facilityName: string) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus fasilitas "${facilityName}"? Data ini mungkin terkait reservasi.`
      )
    ) {
      return;
    }

    setDeletingId(facilityId);

    try {
      if (!token) {
        router.push('/login');
        return;
      }

      // Memanggil endpoint DELETE /api/facilities/:id
      await axios.delete(`http://localhost:5000/api/facilities/${facilityId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update UI secara instan (Optimistic UI)
      setFacilities((prev) => prev.filter((f) => f.facility_id !== facilityId));

      setSuccess(`Fasilitas "${facilityName}" berhasil dihapus.`);
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Gagal menghapus fasilitas.');
      } else {
        setError('Terjadi kesalahan saat menghapus.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  // --- Tampilan Render ---
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

          <Link href="/admin/facilities/create" className="btn-primary flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 110 2h-5v5a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Tambah Fasilitas Baru
          </Link>
        </header>

        <h1 className="text-4xl font-bold mb-6 text-gray-800">Kelola Fasilitas</h1>

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
          <p className="text-blue-500">Memuat daftar fasilitas...</p>
        ) : (
          <div className="table-container">
            <table className="min-w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">ID</th>
                  <th className="table-header-cell">Nama</th>
                  <th className="table-header-cell">Tipe</th>
                  <th className="table-header-cell">Lokasi / Kapasitas</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Aksi</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {facilities.map((f) => (
                  <tr key={f.facility_id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{f.facility_id} - {f.name}
                      </div>
                      <div className="text-xs text-gray-500 max-w-xs truncate">{f.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge-info">{f.type_name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {f.location} ({f.capacity} pax)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          f.is_active ? 'badge-success' : 'badge-danger'
                        }`}
                      >
                        {f.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-4">
                        <Link
                          href={`/admin/facilities/edit/${f.facility_id}`}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(f.facility_id, f.name)}
                          disabled={deletingId === f.facility_id}
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
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2 2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 001 1 2H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {deletingId === f.facility_id ? 'Loading...' : 'Hapus'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Sesuai Figma */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center mb-2">
                <span className="text-3xl mr-2">🏛️</span>
                <span className="text-xl font-bold">Academy Spaces</span>
              </div>
              <p className="text-gray-400">Campus Reservation System for Telkom University</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                About
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Contact
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Terms of Service
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© 2023 Academy Spaces - Campus Reservation System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </Layout>
  );
}
