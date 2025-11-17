/*
 * ===================================================================
 * FILE: client/src/app/admin/equipment/edit/[id]/page.tsx (USING COMPONENTS)
 * ===================================================================
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Layout from '@/components/Layout';

// Tipe data untuk form input
interface EquipmentData {
  name: string;
  type_id: number;
  location: string | null;
  quantity: number;
  description: string | null;
  photo_url: string | null;
  type_name?: string; // Dari response API
}

// Tipe data untuk dropdown
interface FacilityType {
  type_id: number;
  name: string;
}

export default function EditEquipmentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // ID peralatan dari URL

  // State untuk form input
  const [formData, setFormData] = useState<EquipmentData>({
    name: '',
    type_id: 1,
    location: null,
    quantity: 1,
    description: null,
    photo_url: null,
  });

  // State untuk data dan notifikasi
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = Cookies.get('token');

  // --- 1. Ambil Data Tipe Fasilitas & Detail Peralatan (useEffect) ---
  useEffect(() => {
    // Cek token/id
    if (!id || !token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError('');

      try {
        // A. Ambil Daftar Tipe Fasilitas (untuk dropdown)
        const typesResponse = await axios.get('http://localhost:5000/api/facilities/types', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFacilityTypes(typesResponse.data);

        // B. Ambil Detail Peralatan yang akan di-edit
        const equipmentResponse = await axios.get(`http://localhost:5000/api/equipment/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const equipmentData = equipmentResponse.data;

        // Isi state formData dengan data yang sudah ada
        setFormData({
          name: equipmentData.name || '',
          type_id: equipmentData.type_id || 1,
          location: equipmentData.location || '',
          quantity: equipmentData.quantity || 1,
          description: equipmentData.description || '',
          photo_url: equipmentData.photo_url || '',
          type_name: equipmentData.type_name || '',
        });
      } catch (err: unknown) {
        console.error(err);
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 404) {
            setError('Peralatan tidak ditemukan.');
          } else if (err.response.status === 401 || err.response.status === 403) {
            setError('Akses ditolak. Anda tidak diizinkan.');
            router.push('/dashboard');
          } else {
            setError(err.response.data.message || 'Gagal memuat data edit.');
          }
        } else {
          setError('Terjadi kesalahan yang tidak diketahui.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, router, token]);

  // --- 2. Handle Submit Form (PUT Request) ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      if (!formData.name || !formData.type_id || !formData.quantity || formData.quantity < 1) {
        setError('Semua field wajib harus diisi.');
        setIsSubmitting(false);
        return;
      }

      // Hapus 'type_name' dari objek sebelum dikirim ke PUT API
      const { type_name, ...dataToSend } = formData;

      // Panggil API PUT /api/equipment/:id
      await axios.put(`http://localhost:5000/api/equipment/${id}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(`Peralatan '${formData.name}' berhasil diperbarui!`);

      // Redirect kembali ke halaman manajemen setelah sukses
      router.push('/admin/equipment/manage?updated=true');
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 409) {
          setError('Nama peralatan sudah ada (duplikat).');
        } else {
          setError(err.response.data.message || 'Gagal menyimpan pembaruan.');
        }
      } else {
        setError('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. Tampilan Halaman ---
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Memuat data peralatan ID: {id}...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-red-500 text-2xl mb-4">{error}</p>
          <Link href="/admin/equipment/manage" className="text-blue-600 hover:underline">
            Kembali ke Daftar Peralatan
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <Link
            href="/admin/equipment/manage"
            className="text-blue-600 hover:underline flex items-center"
          >
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
            Kembali ke Daftar Peralatan
          </Link>
        </header>

        <h1 className="text-4xl font-bold mb-6 text-gray-800">Edit Peralatan #{id}</h1>

        <form onSubmit={handleUpdate} className="card">
          {/* Notifikasi */}
          {error && (
            <p className="text-red-500 mb-4 bg-red-50 p-2 rounded border border-red-200">{error}</p>
          )}
          {success && (
            <p className="text-green-500 mb-4 bg-green-50 p-2 rounded border border-green-200">
              {success}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Field 1: Tipe Peralatan (Dropdown) */}
            <div>
              <label className="form-label" htmlFor="typeId">
                Tipe Peralatan
              </label>
              <select
                id="typeId"
                // Harus diubah ke string saat menjadi value untuk elemen <select>
                value={formData.type_id.toString()}
                onChange={(e) =>
                  setFormData({ ...formData, type_id: parseInt(e.target.value, 10) })
                }
                className="form-input appearance-none"
                required
              >
                {facilityTypes.map((type) => (
                  <option key={type.type_id} value={type.type_id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 2: Nama Peralatan */}
            <div>
              <label className="form-label" htmlFor="name">
                Nama Peralatan
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                required
              />
            </div>

            {/* Field 3: Lokasi */}
            <div>
              <label className="form-label" htmlFor="location">
                Lokasi (Opsional)
              </label>
              <input
                type="text"
                id="location"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="form-input"
              />
            </div>

            {/* Field 4: Jumlah (Quantity) */}
            <div>
              <label className="form-label" htmlFor="quantity">
                Jumlah Unit
              </label>
              <input
                type="number"
                id="quantity"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseInt(e.target.value, 10) })
                }
                className="form-input"
                required
                min="1"
              />
            </div>
          </div>

          {/* Field 5: Deskripsi (Textarea) */}
          <div className="mt-6">
            <label className="form-label" htmlFor="description">
              Deskripsi
            </label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="form-input"
              required
            />
          </div>

          {/* Field 6: Photo URL */}
          <div className="mt-4 mb-6">
            <label className="form-label" htmlFor="photoUrl">
              Photo URL (Opsional)
            </label>
            <input
              type="url"
              id="photoUrl"
              value={formData.photo_url || ''}
              onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
              className="form-input"
            />
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full flex items-center justify-center"
          >
            {isSubmitting ? (
              'Menyimpan...'
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414 1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a1 1 0 011-1z" />
                </svg>
                Perbarui Peralatan
              </>
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
}
