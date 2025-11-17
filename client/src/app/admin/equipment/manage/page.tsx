/*
 * ===================================================================
 * FILE: client/src/app/admin/equipment/manage/page.tsx (USING COMPONENTS)
 * ===================================================================
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Layout from '@/components/Layout';

// Tipe data Peralatan (dari API)
interface Equipment {
  equipment_id: number;
  name: string;
  type_name: string;
  location: string | null;
  quantity: number;
  is_active: boolean;
  description: string | null;
}

export default function AdminEquipmentManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const token = Cookies.get('token');

  // Cek parameter URL untuk pesan sukses
  useEffect(() => {
    if (searchParams.get('updated') === 'true') {
      setSuccess('Peralatan berhasil diperbarui!');
    }
  }, [searchParams]);

  // --- Fungsi Utama: Fetch Data Peralatan ---
  const fetchEquipment = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (!token) {
        router.push('/login');
        return;
      }

      // Memanggil endpoint GET /api/equipment (yang dilindungi)
      const response = await axios.get('http://localhost:5000/api/equipment', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEquipment(response.data);
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          setError('Akses ditolak. Anda tidak diizinkan di sini.');
        } else {
          setError('Gagal memuat daftar peralatan.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Ambil data saat halaman dimuat
  useEffect(() => {
    fetchEquipment();
  }, [router, token]);

  // --- FUNGSI BARU: Handle Delete Peralatan ---
  const handleDelete = async (equipmentId: number, equipmentName: string) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus peralatan "${equipmentName}"? Data ini mungkin terkait reservasi.`
      )
    ) {
      return;
    }

    setDeletingId(equipmentId);

    try {
      if (!token) {
        router.push('/login');
        return;
      }

      // Memanggil endpoint DELETE /api/equipment/:id
      await axios.delete(`http://localhost:5000/api/equipment/${equipmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Hapus baris dari state secara instan (Optimistic UI)
      setEquipment((prev) => prev.filter((e) => e.equipment_id !== equipmentId));

      setSuccess(`Peralatan "${equipmentName}" berhasil dihapus.`);
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Gagal menghapus peralatan.');
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

          <Link href="/admin/equipment/create" className="btn-primary flex items-center">
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
            Tambah Peralatan Baru
          </Link>
        </header>

        <h1 className="text-4xl font-bold mb-6 text-gray-800">Kelola Peralatan</h1>

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
          <p className="text-blue-500">Memuat daftar peralatan...</p>
        ) : (
          <div className="table-container">
            <table className="min-w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">ID / Nama</th>
                  <th className="table-header-cell">Tipe</th>
                  <th className="table-header-cell">Lokasi / Jumlah</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Aksi</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {equipment.map((e) => (
                  <tr key={e.equipment_id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{e.equipment_id} - {e.name}
                      </div>
                      <div className="text-xs text-gray-500 max-w-xs truncate">{e.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge-info">{e.type_name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {e.location || 'N/A'} ({e.quantity} unit)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          e.is_active ? 'badge-success' : 'badge-danger'
                        }`}
                      >
                        {e.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-4">
                        <Link
                          href={`/admin/equipment/edit/${e.equipment_id}`}
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
                          onClick={() => handleDelete(e.equipment_id, e.name)}
                          disabled={deletingId === e.equipment_id}
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
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {deletingId === e.equipment_id ? '...' : 'Hapus'}
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
    </Layout>
  );
}
