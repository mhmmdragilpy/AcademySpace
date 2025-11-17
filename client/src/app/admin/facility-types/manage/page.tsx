/*
 * ===================================================================
 * FILE: client/src/app/admin/facility-types/manage/page.tsx (USING COMPONENTS)
 * ===================================================================
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Layout from '@/components/Layout';

// Tipe data untuk Master Data
interface FacilityType {
  type_id: number;
  name: string;
  description: string;
}

// Tipe data untuk form
interface FormInput {
  name: string;
  description: string;
}

export default function AdminFacilityTypeManagementPage() {
  const router = useRouter();
  const [types, setTypes] = useState<FacilityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State CRUD
  const [isCreating, setIsCreating] = useState(false);
  const [editingType, setEditingType] = useState<FacilityType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // State Form
  const [formData, setFormData] = useState<FormInput>({ name: '', description: '' });

  const token = Cookies.get('token');

  // --- Fungsi Utama: Fetch Data Tipe Fasilitas ---
  const fetchTypes = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (!token) {
        router.push('/login');
        return;
      }

      // Memanggil endpoint GET /api/facilities/types
      const response = await axios.get('http://localhost:5000/api/facilities/types', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTypes(response.data);
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError('Akses ditolak. Anda tidak memiliki izin admin.');
      } else {
        setError('Gagal memuat daftar tipe fasilitas.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Ambil data saat halaman dimuat
  useEffect(() => {
    fetchTypes();
  }, [router, token]);

  // --- 1. HANDLE SUBMIT (CREATE / UPDATE) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    const isUpdate = !!editingType; // True jika sedang mode edit
    const url = isUpdate
      ? `http://localhost:5000/api/facilities/types/${editingType?.type_id}`
      : 'http://localhost:5000/api/facilities/types';
    const method = isUpdate ? axios.put : axios.post;

    try {
      const response = await method(url, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Setelah sukses, refresh data dan reset form
      setFormData({ name: '', description: '' });
      setEditingType(null);
      setIsCreating(false);
      setSuccess(`Tipe Fasilitas berhasil di-${isUpdate ? 'perbarui' : 'buat'}!`);

      // Fetch ulang data untuk update tabel
      await fetchTypes();
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Gagal memproses data.');
      } else {
        setError('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 2. HANDLE DELETE ---
  const handleDelete = async (typeId: number, typeName: string) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus tipe fasilitas "${typeName}"? Ini akan gagal jika masih ada fasilitas yang menggunakannya.`
      )
    ) {
      return;
    }
    setDeletingId(typeId);

    try {
      await axios.delete(`http://localhost:5000/api/facilities/types/${typeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(`Tipe Fasilitas "${typeName}" berhasil dihapus.`);
      // Update UI secara instan
      setTypes((prev) => prev.filter((t) => t.type_id !== typeId));
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Gagal menghapus.');
      } else {
        setError('Terjadi kesalahan saat menghapus.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  // --- 3. HANDLE EDIT MODE ---
  const startEdit = (type: FacilityType) => {
    setEditingType(type);
    setFormData({ name: type.name, description: type.description });
    setIsCreating(false); // Pastikan mode create off
  };

  const cancelEdit = () => {
    setEditingType(null);
    setFormData({ name: '', description: '' });
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingType(null);
    setFormData({ name: '', description: '' });
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

          <button onClick={startCreate} className="btn-primary flex items-center">
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
            Tambah Tipe Baru
          </button>
        </header>

        <h1 className="text-4xl font-bold mb-6 text-gray-800">
          Kelola Data Master (Tipe Fasilitas)
        </h1>

        {/* AREA FORM CREATE/EDIT */}
        {(isCreating || editingType) && (
          <div className="mb-8 card">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              {editingType ? `Edit Tipe #${editingType.type_id}` : 'Tambah Tipe Baru'}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="form-label" htmlFor="typeName">
                  Nama Tipe (Misal: Ruangan)
                </label>
                <input
                  type="text"
                  id="typeName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="form-label" htmlFor="typeDesc">
                  Deskripsi
                </label>
                <input
                  type="text"
                  id="typeDesc"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="col-span-full flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 rounded-lg text-gray-700 border border-gray-300 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting
                    ? 'Menyimpan...'
                    : editingType
                      ? 'Perbarui Tipe'
                      : 'Simpan Tipe Baru'}
                </button>
              </div>
            </form>
          </div>
        )}
        {/* AKHIR AREA FORM */}

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
          <p className="text-blue-500">Memuat daftar tipe fasilitas...</p>
        ) : (
          <div className="table-container">
            <table className="min-w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">ID</th>
                  <th className="table-header-cell">Nama</th>
                  <th className="table-header-cell">Deskripsi</th>
                  <th className="table-header-cell">Aksi</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {types.map((type) => (
                  <tr key={type.type_id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{type.type_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {type.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{type.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-4">
                        <button
                          onClick={() => startEdit(type)}
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
                        </button>
                        <button
                          onClick={() => handleDelete(type.type_id, type.name)}
                          disabled={deletingId === type.type_id}
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
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {deletingId === type.type_id ? '...' : 'Hapus'}
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
