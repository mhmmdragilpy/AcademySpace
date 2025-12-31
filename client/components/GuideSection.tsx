// [USE CASE #17] Melihat Guide Penggunaan Website - Text Panduan
"use client";

import { useState } from 'react';

const GuideSection = () => {
  const [expanded, setExpanded] = useState(false);

  const guideContent = [
    "Akses menu 'Availability' untuk melihat ketersediaan ruangan secara real-time dan transparan.",
    "Lakukan reservasi sepenuhnya secara online. Isi formulir digital dan unggah dokumen pendukung (Proposal/Rundown) tanpa perlu mencetak berkas fisik.",
    "Sistem 'Smart Approval' kami mempercepat proses verifikasi. Pantau status pengajuan Anda (Pending/Approved) langsung dari Dashboard atau Notifikasi.",
    "Ketentuan Waktu: Pengajuan kegiatan reguler minimal H-3. Untuk event besar/skala prioritas, ajukan minimal H-7 untuk kelancaran verifikasi.",
    "Setelah disetujui, E-Permit (Izin Digital) akan diterbitkan otomatis. Tunjukkan E-Permit kepada petugas di lokasi saat hari pelaksanaan.",
    "Layanan terintegrasi 24/7. Tidak perlu lagi datang ke kantor fisik untuk sekadar mengecek jadwal atau mengantar surat."
  ];

  return (
    <div id="guide" className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-[#08294B] tracking-tight">Digital Booking Guide</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Transformasi layanan peminjaman ruangan yang modern, efisien, dan paperless.
            Nikmati kemudahan reservasi dalam genggaman.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
          <ul className="space-y-6">
            {guideContent.map((item, index) => (
              <li key={index} className="flex items-start group">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#E6F0F9] flex items-center justify-center text-[#FA7436] mt-0.5 group-hover:bg-[#FA7436] group-hover:text-white transition-colors duration-300">
                  <span className="font-bold text-sm">{index + 1}</span>
                </div>
                <span className="ml-4 text-gray-700 text-lg leading-relaxed font-medium">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col sm:flex-row gap-5 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center bg-[#FA7436] text-white font-bold py-3 px-8 rounded-full hover:bg-[#e5672f] transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
            >
              Cek Ketersediaan
            </a>
            <a
              href="/MyReservationsPage"
              className="inline-flex items-center justify-center bg-white text-[#08294B] border-2 border-[#08294B] font-bold py-3 px-8 rounded-full hover:bg-gray-50 transform hover:scale-105 transition-all shadow-md hover:shadow-lg"
            >
              Riwayat Reservasi
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideSection;