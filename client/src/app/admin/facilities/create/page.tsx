/*
 * ===================================================================
 * FILE: client/src/app/admin/facilities/create/page.tsx (USING COMPONENTS)
 * ===================================================================
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Layout from '@/components/Layout';

// Tipe data untuk dropdown (dari API /api/facilities/types)
interface FacilityType {
  type_id: number;
  name: string;
}

export default function CreateFacilityPage() {
  const router = useRouter();

  // State untuk form input
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(1);
  const [layoutDescription, setLayoutDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [typeId, setTypeId] = useState<number | ''>('');

  // State untuk data dan notifikasi
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = Cookies.get('token');

  // 1. Ambil Data Tipe Fasilitas (untuk dropdown)
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/facilities/types', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFacilityTypes(response.data);
        // Set default typeId ke yang pertama
        if (response.data.length > 0) {
          setTypeId(response.data[0].type_id);
        }
      } catch (err: unknown) {
        console.error('DEBUG LOG (FETCH TYPES):', err);

        if (axios.isAxiosError(err) && err.response) {
          console.error('Backend Response Data:', err.response.data);
          if (err.response.status === 401 || err.response.status === 403) {
            setError('Akses ditolak. Anda tidak terotentikasi.');
          } else {
            // Tampilkan pesan error dari backend, jika ada
            setError(
              `Gagal memuat tipe fasilitas. Server: ${err.response.data.message || 'Error 500/No message'}`
            );
          }
        } else {
          setError('Gagal memuat tipe fasilitas. (Network Error)');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTypes();
  }, [router, token]);

  // 2. Handle Submit Form (POST /api/facilities)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      if (!typeId) {
        setError('Tipe fasilitas harus dipilih.');
        setIsSubmitting(false);
        return;
      }

      const facilityData = {
        name,
        type_id: typeId,
        location,
        capacity: parseInt(capacity.toString(), 10),
        layout_description: layoutDescription || null,
        photo_url: photoUrl || null,
      };

      await axios.post('http://localhost:5000/api/facilities', facilityData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(`Fasilitas '${name}' berhasil dibuat!`);
      // Reset form (opsional)
      setName('');
      setLocation('');
      setCapacity(1);
      setLayoutDescription('');
      setPhotoUrl('');
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 409) {
          setError('Nama fasilitas sudah digunakan (duplikat).');
        } else {
          setError(err.response.data.message || 'Gagal menyimpan fasilitas.');
        }
      } else {
        setError('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Memuat data master...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <Link
            href="/admin/facilities/manage"
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
            Kembali ke Daftar Fasilitas
          </Link>
        </header>

        <h1 className="text-4xl font-bold mb-6 text-gray-800">Tambah Fasilitas Baru</h1>

        <form onSubmit={handleSubmit} className="card">
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
            {/* Field 1: Tipe Fasilitas (Dropdown) */}
            <div>
              <label className="form-label" htmlFor="typeId">
                Tipe Fasilitas
              </label>
              <select
                id="typeId"
                value={typeId}
                onChange={(e) => setTypeId(parseInt(e.target.value, 10))}
                className="form-input appearance-none"
                required
                disabled={facilityTypes.length === 0}
              >
                {facilityTypes.map((type) => (
                  <option key={type.type_id} value={type.type_id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 2: Nama Fasilitas */}
            <div>
              <label className="form-label" htmlFor="name">
                Nama Fasilitas
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Field 3: Lokasi */}
            <div>
              <label className="form-label" htmlFor="location">
                Lokasi
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Field 4: Kapasitas */}
            <div>
              <label className="form-label" htmlFor="capacity">
                Kapasitas (Orang)
              </label>
              <input
                type="number"
                id="capacity"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
                className="form-input"
                required
                min="1"
              />
            </div>
          </div>

          {/* Field 5: Deskripsi Layout (Textarea) */}
          <div className="mt-6">
            <label className="form-label" htmlFor="layoutDescription">
              Deskripsi Detail/Layout
            </label>
            <textarea
              id="layoutDescription"
              value={layoutDescription}
              onChange={(e) => setLayoutDescription(e.target.value)}
              rows={4}
              className="form-input"
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
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={isSubmitting || facilityTypes.length === 0}
            className="btn-primary w-full flex items-center justify-center"
          >
            {isSubmitting ? (
              'Memproses...'
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M7.707 10.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V6a1 1 0 011-1z" />
                </svg>
                Simpan Fasilitas
              </>
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
}
