<p align="center">
  <img src="client/public/logo.svg" alt="Academy Space Logo" width="120" height="120">
</p>

<h1 align="center">🏫 Academy Space</h1>

<p align="center">
  <strong>Sistem Reservasi Fasilitas Kampus Modern</strong>
</p>

<p align="center">
  <a href="#-fitur-utama">Fitur</a> •
  <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> •
  <a href="#-struktur-project">Struktur</a> •
  <a href="#-instalasi">Instalasi</a> •
  <a href="#-api-endpoints">API</a> •
  <a href="#-deployment">Deployment</a>
</p>

---

## 📖 Deskripsi

**Academy Space** adalah aplikasi web full-stack modern untuk manajemen dan reservasi fasilitas kampus. Sistem ini dirancang untuk memudahkan mahasiswa dan dosen dalam memesan ruangan dan gedung secara online, transparan, dan efisien.

Dilengkapi dengan sistem deteksi konflik jadwal cerdas dan alur persetujuan digital, Academy Space menghilangkan redundansi dan tumpang tindih dalam pemakaian fasilitas kampus.

## ✨ Fitur Utama

### 👥 Untuk User (Mahasiswa/Dosen)
- 🔐 **Autentikasi Aman** - Login & Register dengan JWT
- 🏢 **Eksplorasi Fasilitas** - Cari gedung dan ruangan dengan detail lengkap (Kapasitas, Foto, Fasilitas)
- 📅 **Smart Availability Check** - Cek ketersediaan ruangan secara real-time dengan kalender interaktif
- 📝 **Pengajuan Reservasi** - Booking dengan upload proposal dan validasi tanggal
- ⭐ **Rating & Ulasan** - Berikan bintang dan ulasan untuk ruangan yang telah selesai digunakan
- 🔔 **Riwayat & Status** - Pantau status pengajuan (Pending/Approved/Rejected)

### 🛡️ Untuk Admin
- 📊 **Dashboard Eksekutif** - Statistik penggunaan fasilitas
- ✅ **Manajemen Persetujuan** - Review pengajuan reservasi dengan cepat
- 🛠️ **Manajemen Fasilitas** - Tambah/Edit/Hapus gedung dan ruangan, set status maintenance
- 👤 **Manajemen Pengguna** - Kelola akun user dan akses role
- 🔧 **Konfigurasi Sistem** - Kelola variabel sistem via token

## 🛠️ Tech Stack

### 🖥️ Frontend (Client)
| Teknologi | Deskripsi |
|-----------|-----------|
| **Next.js 16** | Framework React Modern dengan App Router & Turbopack |
| **React 19** | Library UI terkini |
| **TypeScript** | Bahasa pemrograman type-safe |
| **TailwindCSS 4** | Styling framework utility-first |
| **NextAuth.js 5** | Solusi autentikasi lengkap |
| **TanStack Query** | Manajemen state server yang powerful |
| **Zustand** | State management yang ringan |
| **Shadcn/UI** | Komponen UI yang indah dan aksesibel |
| **Lucide React** | Ikon modern |

### ⚙️ Backend (Server)
| Teknologi | Deskripsi |
|-----------|-----------|
| **Node.js** | Runtime environment JavaScript |
| **Express.js** | Framework web server yang cepat dan minimalis |
| **PostgreSQL** | Database relasional yang robust |
| **TypeScript** | Keamanan tipe di backend |
| **JWT** | Standar keamanan token |
| **Multer** | Middleware upload file |
| **Winston** | Logger sistem yang handal |
| **Helmet** | Header keamanan HTTP |

## 📁 Struktur Project

```
academy_space/
├── 📂 client/                    # Frontend (Next.js 16)
│   ├── 📂 app/                   # App Router
│   │   ├── 📂 admin/             # Dashboard Admin
│   │   ├── 📂 availability/      # Halaman Detail Ruangan & Booking
│   │   ├── 📂 cek-ketersediaan/  # Landing Page Pencarian
│   │   ├── 📂 login/             # Auth Pages
│   │   └── 📂 reservations/      # User Dashboard
│   ├── 📂 components/            # Reusable Components
│   ├── 📂 hooks/                 # Custom React Hooks (React Query)
│   └── 📂 lib/                   # Utilities (API client, etc)
│
├── 📂 server/                    # Backend (Express)
│   ├── 📂 src/
│   │   ├── 📂 config/            # Env Configuration
│   │   ├── 📂 controllers/       # Request Handlers
│   │   ├── 📂 db/                # Database Setup & Migrations
│   │   ├── 📂 middlewares/       # Auth, Error, Upload Middleware
│   │   ├── 📂 repositories/      # Data Access Layer (SQL Queries)
│   │   ├── 📂 routes/            # API Route Definitions
│   │   ├── 📂 services/          # Business Logic
│   │   └── index.ts              # Entry Point
│   └── 📂 uploads/               # User Uploaded Proposals
│
├── docker-compose.yml            # Container Orchestration
└── README.md                     # Dokumentasi Project
```

## 🗄️ Database Schema

Sistem menggunakan PostgreSQL dengan skema relasional yang teroptimasi:

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│    users    │────<│   reservations  │>────│  facilities │
└─────────────┘     └─────────────────┘     └─────────────┘
       │                    │                      │
       │                    │                      │
       ▼                    ▼                      ▼
┌─────────────┐     ┌──────────────────┐    ┌─────────────┐
│notifications│     │reservation_items │    │  buildings  │
└─────────────┘     └──────────────────┘    └─────────────┘
       │                    │                      │
       │                    ▼                      │
       │            ┌─────────────┐                │
       └───────────>│   ratings   │<───────────────┘
                    └─────────────┘
```

## 🚀 Instalasi & Menjalankan

### Prerequisites
- Node.js >= 20.x
- PostgreSQL >= 15.x
- Git

### 1️⃣ Clone Repository
```bash
git clone https://github.com/yourusername/academy-space.git
cd academy_space
```

### 2️⃣ Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3️⃣ Setup Environment Variables

**Server** (`server/.env`):
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/academy_space
JWT_SECRET=rahasia_negara_api
CLIENT_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

**Client** (`client/.env`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
AUTH_SECRET=rahasia_next_auth
```

### 4️⃣ Setup Database
```bash
cd server

# Setup Schema (Drop & Create Tables)
npx tsx src/db/setup.ts

# Seed Initial Data (Dummy Data)
npm run seed
```

### 5️⃣ Jalankan Aplikasi

**Mode Development** (Jalankan di 2 terminal terpisah):

Terminal 1 (Backend):
```bash
cd server
npm run dev
# Server running at http://localhost:5000
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
# Client running at http://localhost:3000
```

## 📡 API Endpoints Utama

### Auth
- `POST /auth/login` - Login user/admin
- `POST /auth/register` - Registrasi user

### Facilities
- `GET /facilities` - List semua fasilitas
- `GET /facilities/:id` - Detail fasilitas
- `GET /facilities/:id/reservations` - Cek jadwal fasilitas

### Reservations
- `POST /reservations` - Buat reservasi baru
- `GET /reservations/my` - List reservasi user login
- `POST /reservations/:id/cancel` - Batalkan reservasi

### Ratings
- `POST /ratings` - Submit ulasan (hanya setelah reservasi selesai)
- `GET /ratings/facility/:id` - Lihat ulasan fasilitas

---

<p align="center">
  Made with ❤️ by <strong>Academy Space Team</strong>
</p>
