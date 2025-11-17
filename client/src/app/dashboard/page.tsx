/*
 * ======================================================
 * FILE: client/src/app/dashboard/page.tsx (USING COMPONENTS)
 * ======================================================
 */
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Layout from '@/components/Layout';

// Interface User
interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
}

// Interface Fasilitas
interface Facility {
  facility_id: number;
  name: string;
  type_name: string;
  location: string;
  capacity: number;
  photo_url: string;
}

// Interface Slot Sibuk
interface BusySlot {
  start_datetime: string;
  end_datetime: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const token = Cookies.get('token');

  // 1. Ambil Data User
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser) as User);
    } else {
      router.push('/login');
    }
  }, [router]);

  // 2. Ambil Data Fasilitas
  useEffect(() => {
    if (user) {
      const fetchFacilities = async () => {
        setIsLoading(true);
        setError('');

        if (!token) {
          setError('Sesi tidak ditemukan. Silakan login kembali.');
          setIsLoading(false);
          router.push('/login');
          return;
        }

        try {
          const response = await axios.get('http://localhost:5000/api/facilities', {
            headers: { Authorization: `Bearer ${token}` },
          });

          setFacilities(response.data);
        } catch (err) {
          console.error(err);
          setError('Gagal mengambil data fasilitas.');
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            router.push('/login');
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchFacilities();
    }
  }, [user, router]);

  // Filter fasilitas berdasarkan kategori
  const filteredFacilities = useMemo(() => {
    let filtered = facilities;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (facility) => facility.type_name.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (facility) =>
          facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          facility.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [facilities, selectedCategory, searchQuery]);

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Area Hero Section */}
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-8 rounded-xl shadow-lg relative overflow-hidden mb-12">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Booking a spot is now much easier
            </h2>
            <p className="text-white mb-6">
              Find and instantly book a spot in campus for your necessities.
            </p>

            {/* Area Search Bar */}
            <div className="bg-white p-2 rounded-lg shadow-xl flex items-center mb-4">
              <input
                type="text"
                placeholder="Search Campus Facilities"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-gray-800 px-3 py-2 w-full focus:outline-none"
              />
              <button className="bg-blue-500 text-white px-3 py-2 rounded-lg ml-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Kategori Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === 'all' ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
                }`}
                onClick={() => setSelectedCategory('all')}
              >
                All
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === 'classrooms'
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-500 text-white'
                }`}
                onClick={() => setSelectedCategory('classrooms')}
              >
                Classrooms
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === 'sports'
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-500 text-white'
                }`}
                onClick={() => setSelectedCategory('sports')}
              >
                Sports
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === 'laboratories'
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-500 text-white'
                }`}
                onClick={() => setSelectedCategory('laboratories')}
              >
                Laboratories
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === 'auditoriums'
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-500 text-white'
                }`}
                onClick={() => setSelectedCategory('auditoriums')}
              >
                Auditoriums
              </button>
            </div>
          </div>
        </div>

        {/* --- Area Konten Fasilitas --- */}
        <div className="mb-6">
          <h2 className="text-3xl font-semibold text-gray-800">
            Everything the campus has to offer
          </h2>
        </div>

        {/* Area Kartu Fasilitas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {isLoading ? (
            <p className="text-blue-500 col-span-full">Mengambil data fasilitas...</p>
          ) : error ? (
            <p className="text-red-500 col-span-full">{error}</p>
          ) : (
            filteredFacilities.map((facility) => (
              <div key={facility.facility_id} className="card card-hover flex flex-col">
                <div className="w-full h-40 bg-gray-200 rounded-t-xl overflow-hidden">
                  {facility.photo_url ? (
                    <img
                      src={facility.photo_url}
                      alt={facility.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      [Foto tidak tersedia]
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-1 truncate text-gray-800">{facility.name}</h3>
                  <p className="text-sm text-blue-600 font-semibold mb-3">{facility.type_name}</p>

                  <div className="flex justify-between text-sm text-gray-500 mt-auto">
                    <span>👥 {facility.capacity} pax</span>
                    <span>📍 {facility.location}</span>
                  </div>

                  <Link
                    href={`/facilities/${facility.facility_id}`}
                    className="btn-primary mt-3 w-full text-center"
                  >
                    Lihat Detail & Reservasi
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Most Valuable Places Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Most Valuable Places</h2>
          <div className="card">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt="Most Valuable Place"
                  className="w-full h-64 md:h-full object-cover rounded-l-xl"
                />
              </div>
              <div className="md:w-1/2 p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">TULT Auditorium</h3>
                <p className="text-gray-600 mb-4">
                  The state-of-the-art auditorium with a seating capacity of 500 people, equipped
                  with modern audio-visual technology for conferences, seminars, and cultural
                  events.
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span className="mr-4">👥 500 pax</span>
                  <span>📍 Main Building, 2nd Floor</span>
                </div>
                <Link href="/facilities/1" className="btn-primary">
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
