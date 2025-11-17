# 🚀 Academy Spaces: Sistem Reservasi Fasilitas Kampus Modern

Academy Spaces adalah aplikasi web full-stack yang dirancang untuk mempermudah proses peminjaman dan manajemen fasilitas di lingkungan akademik. Mahasiswa dapat dengan mudah menemukan dan memesan ruangan, sementara administrator memiliki dasbor terpusat untuk mengelola semua fasilitas, peralatan, dan reservasi.

[![Project Screenshot](https://i.ibb.co/L8z0gK8/Screenshot-2024-05-16-at-20-43-39.png)](https://i.ibb.co/L8z0gK8/Screenshot-2024-05-16-at-20-43-39.png)

---

## ✨ Fitur Utama

- **Pencarian & Reservasi Intuitif:** Antarmuka yang bersih bagi mahasiswa untuk mencari fasilitas berdasarkan ketersediaan dan melakukan reservasi.
- **Dasbor Pengguna:** Setiap pengguna dapat melihat riwayat dan status reservasi mereka saat ini.
- **Panel Admin Komprehensif:** Dasbor khusus untuk admin guna mengelola fasilitas, peralatan, dan semua reservasi (menyetujui, menolak, atau membatalkan).
- **Sistem Otentikasi Berbasis Peran:** Perbedaan hak akses yang jelas antara `USER` (mahasiswa) dan `ADMIN`.
- **Pengalaman Pengguna Modern:** Dibangun dengan pola UI/UX modern seperti *skeleton loading* dan notifikasi *toast interaktif* untuk memberikan *feedback* yang cepat dan jelas.

---

## 🛠️ Tumpukan Teknologi

Aplikasi ini terbagi menjadi dua bagian utama: `client` (frontend) dan `server` (backend).

| Bagian | Teknologi Utama |
| :--- | :--- |
| **Frontend** (`/client`) | `Next.js`, `React`, `TypeScript`, `Tailwind CSS`, `Axios`, `React Hot Toast` |
| **Backend** (`/server`) | `Node.js`, `Express`, `TypeScript`, `Prisma`, `PostgreSQL`, `Zod`, `JWT` |

---

## 🏁 Panduan Instalasi & Menjalankan (Full-Stack)

Untuk menjalankan keseluruhan aplikasi di lingkungan lokal Anda, ikuti langkah-langkah berikut.

**Prasyarat:**
- Node.js (v18 atau lebih tinggi)
- NPM / Yarn
- Akses ke server database PostgreSQL

### Langkah 1: Setup Backend (`/server`)

Buka terminal pertama Anda.

```bash
# 1. Masuk ke direktori server
cd server

# 2. Install semua dependencies
npm install

# 3. Buat file .env dari contoh dan isi koneksi database Anda
# (Lihat server/README.md untuk detail)
cp .env.example .env

# 4. Jalankan migrasi database Prisma
npx prisma migrate dev

# 5. Jalankan server backend (akan berjalan di http://localhost:5000)
npm run dev
```

### Langkah 2: Setup Frontend (`/client`)

Buka terminal **kedua** (biarkan terminal pertama tetap menjalankan server).

```bash
# 1. Masuk ke direktori client
cd client

# 2. Install semua dependencies
npm install

# 3. Jalankan server frontend (akan berjalan di http://localhost:3000)
npm run dev
```

### Langkah 3: Buka Aplikasi

Setelah kedua server berjalan, buka browser Anda dan akses:

**[http://localhost:3000](http://localhost:3000)**

Anda sekarang dapat berinteraksi dengan aplikasi Academy Spaces secara penuh!

---

*Proyek ini adalah demonstrasi dari aplikasi web modern, tangguh, dan berorientasi pada pengguna.*