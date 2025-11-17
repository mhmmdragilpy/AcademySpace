/*
 * ======================================================
 * FILE: client/src/app/login/page.tsx (PERBAIKAN FUNGSI LOGIN)
 * ======================================================
 */
'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import Layout from '@/components/Layout';

export default function LoginPage() {
  const router = useRouter();
  // PERBAIKAN: Mengganti state 'username' menjadi 'email' untuk sinkronisasi
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!email || !password) { // <-- Menggunakan email
        setError('Email dan password harus diisi.');
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: email, // <-- Mengirim 'email' (sesuai harapan backend)
        password: password,
        userType: userType, // Boleh diabaikan di backend, tapi dikirim
      });

      Cookies.set('token', response.data.token, {
        expires: 1,
        secure: process.env.NODE_ENV === 'production',
      });
      localStorage.setItem('user', JSON.stringify(response.data.user));

      router.push('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Kredensial tidak valid.');
      } else {
        setError('Terjadi kesalahan jaringan.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout showNavigation={false}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-sm p-4">
          <div className="card">
            {/* ... (Header dan Toggle tidak berubah) ... */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 text-blue-800 mb-4">
                <span className="text-4xl">🏛️</span>
                <span className="text-xl font-bold">Academy Spaces</span>
              </div>
              <h1 className="text-3xl font-bold text-blue-800">LOGIN</h1>
            </div>

            {/* Toggle */}
            <div className="flex bg-gray-200 rounded-lg p-1 mb-6">
              <button
                className={`flex-1 py-2 rounded-lg font-semibold text-sm transition ${
                  userType === 'student' ? 'bg-blue-800 text-white' : 'text-blue-800'
                }`}
                onClick={() => setUserType('student')}
              >
                Student
              </button>
              <button
                className={`flex-1 py-2 rounded-lg font-semibold text-sm transition ${
                  userType === 'admin' ? 'bg-blue-400 text-white' : 'text-blue-800'
                }`}
                onClick={() => setUserType('admin')}
              >
                Admin
              </button>
            </div>


            <form onSubmit={handleSubmit}>
              {/* Input Email (sebelumnya Username) */}
              <div className="relative mb-4">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-10"
                  required
                />
              </div>

              {/* Input Password */}
              <div className="relative mb-3">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10 pr-10"
                  required
                />
                <span
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {/* ... (Eye icon logic) ... */}
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fillRule="evenodd" d="M.661 10.592A13.25 13.25 0 0110 3.5c3.272 0 6.305 1.18 8.64 3.092a1 1 0 010 1.816A13.25 13.25 0 0110 16.5c-3.272 0-6.305-1.18-8.64-3.092a1 1 0 010-1.816zM10 14a4 4 0 100-8 4 4 0 000 8z" clipRule="evenodd" /></svg>
                  )}
                </span>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-red-500 text-sm">{error}</p>
                <Link href="#" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot Password?
                </Link>
              </div>

              {/* Tombol Login */}
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? 'Logging In...' : 'Login'}
              </button>

              {/* Link ke Register */}
              <div className="text-center mt-4">
                <Link href="/register" className="text-sm text-gray-600 hover:text-blue-600">
                  Don't have an account? <span className="font-semibold">Sign up</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}