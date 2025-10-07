'use client'; // Wajib untuk menggunakan hooks seperti useState dan useEffect

import { useState, useEffect } from 'react';

export default function Home() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    // Ambil data dari API Go
    fetch('http://localhost:8080/api/ping')
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
      })
      .catch(() => {
        setMessage('Gagal terhubung ke backend.');
      });
  }, []); // Array kosong berarti efek ini hanya berjalan sekali saat komponen dimuat

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Academyspace</h1>
      <p className="mt-4 text-lg bg-gray-100 p-4 rounded-md">
        Pesan dari Backend: <span className="font-semibold text-blue-600">{message}</span>
      </p>
    </main>
  );
}