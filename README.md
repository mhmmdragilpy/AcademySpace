<div align="center">
  <img src="client/public/logo.svg" alt="Academy Space Logo" width="120" height="120" />
  
  # Academy Space
  
  **Sistem Reservasi Fasilitas Kampus Modern & Terintegrasi**
  
  [![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)]()
  [![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)]()
  [![Tech Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20Express%20%7C%20PostgreSQL-7356f9?style=flat-square)]()

  <p align="center">
    <a href="https://academy-space.vercel.app/" target="_blank">
      <img src="https://img.shields.io/badge/🚀_Live_Demo-Visit_Academy_Space-000000?style=for-the-badge&logo=vercel" alt="Live Demo" />
    </a>
  </p>

  <p>
    <b>Academy Space</b> adalah solusi digital komprehensif untuk manajemen peminjaman fasilitas kampus. 
    Dirancang untuk memberikan pengalaman reservasi yang <i>seamless</i>, transparan, dan efisien bagi seluruh civitas akademika.
  </p>

</div>

---

## 🏗️ Technology Stack

Project ini dibangun menggunakan teknologi modern untuk memastikan performa, skalabilitas, dan *user experience* terbaik.

### Frontend / Client
| Technology | Description |
| :--- | :--- |
| **Next.js 16** | Framework React modern dengan App Router & Server Components. |
| **React 19** | Library UI terkini untuk interaktivitas tinggi. |
| **TypeScript** | Static typing untuk kode yang lebih robust dan maintainable. |
| **TailwindCSS 4** | Styling framework utility-first untuk desain responsif. |
| **Shadcn/UI** | Set komponen UI yang modular dan aksesibel. |
| **TanStack Query** | Manajemen state server-side yang efisien. |
| **Zustand** | State management client-side yang ringan. |

### Backend / Server
| Technology | Description |
| :--- | :--- |
| **Node.js & Express** | Runtime & Framework backend yang cepat dan fleksibel. |
| **PostgreSQL** | Database relasional utama untuk data integritas tinggi. |
| **Redis** | In-memory store untuk caching dan session management. |
| **SQL (pg)** | Data Access Layer yang optimal dan native. |
| **JWT & Bcrypt** | Standar keamanan untuk Autentikasi dan Otorisasi. |
| **Nodemailer** | Layanan pengiriman notifikasi email. |

---

## ✨ Fitur Utama

Berikut adalah kapabilitas utama yang telah diimplementasikan dalam Academy Space:

*   **🔐 Secure Authentication**: Sistem login aman untuk Mahasiswa, Dosen, dan Admin menggunakan JWT.
*   **🏢 Facility Browsing**: Katalog lengkap gedung dan ruangan dengan detail fasilitas, kapasitas, dan galeri foto.
*   **📅 Smart Availability System**: Pengecekan ketersediaan ruangan secara *real-time* untuk mencegah jadwal bentrok.
*   **📝 Automated Reservation Flow**: Proses pengajuan peminjaman yang terstruktur, mulai dari upload proposal hingga approval.
*   **🔔 Real-time Notifications**: Notifikasi status pengajuan (Disetujui/Ditolak/Pending).
*   **📊 Admin Dashboard**: Panel kontrol komprehensif untuk manajemen aset, approval reservasi, dan laporan penggunaan.
*   **⭐ Rating & Feedback**: Sistem ulasan transparan untuk mengevaluasi kondisi fasilitas pasca-pemakaian.

---

## 📸 Screenshots

> *Visualisasi antarmuka aplikasi user dan admin dashboard.*

| **Login Page** | **Dashboard User** |
| :---: | :---: |
| ![Login Page Placeholder](https://via.placeholder.com/600x300?text=Login+Page+Screenshot) | ![Dashboard Placeholder](https://via.placeholder.com/600x300?text=Dashboard+User+Screenshot) |

| **Facility Detail** | **Admin Panel** |
| :---: | :---: |
| ![Detail Placeholder](https://via.placeholder.com/600x300?text=Facility+Detail+Screenshot) | ![Admin Placeholder](https://via.placeholder.com/600x300?text=Admin+Panel+Screenshot) |

---

## ⚙️ Prerequisites

Sebelum memulai instalasi, pastikan environment Anda telah memenuhi syarat berikut:

*   **Node.js**: Versi `20.x` atau lebih baru.
*   **PostgreSQL**: Versi `15.x` siap berjalan.
*   **Redis**: (Optional namun direkomendasikan untuk fitur lanjutan).
*   **Git**: Untuk cloning repository.

---

## 🚀 Installation & Getting Started

Ikuti langkah-langkah berikut untuk menjalankan project ini di komputer lokal Anda.

### 1. Clone Repository
```bash
git clone https://github.com/mhmmdragilpy/AcademySpace.git
cd AcademySpace
```

### 2. Install Dependencies
Install dependency untuk kedua sisi (Server & Client).
```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 3. Environment Setup
Buat file `.env` di folder `server` dan `client` sesuai dengan contoh berikut.

**Server (`server/.env`)**:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/academy_space
JWT_SECRET=your_super_secret_key
# Konfigurasi tambahan (Redis, Email, etc) jika dperlukan
```

**Client (`client/.env`)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
AUTH_SECRET=your_auth_secret
```

### 4. Database Setup
Lakukan migrasi skema dan *seeding* data awal.

```bash
cd server

# Setup Schema (Drop & Create Tables)
npx tsx src/db/setup.ts

# Seeding Data Dummy
npx tsx src/db/seed.ts
```

### 5. Running the Application
Jalankan backend dan frontend pada terminal yang berbeda.

**Terminal 1 (Backend)**:
```bash
cd server
npm run dev
# Server berjalan di http://localhost:5000
```

**Terminal 2 (Frontend)**:
```bash
cd client
npm run dev
# Aplikasi dapat diakses di http://localhost:3000
```

---

## 👤 Author

Developed with ❤️ by **Mang Do-san**
