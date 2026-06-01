<div align="center">

  # 🎓 Academy Space

  ### Sistem Reservasi Fasilitas Kampus Modern & Terintegrasi

  <br/>

  [![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Redis](https://img.shields.io/badge/Redis-Alpine-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

  <br/>

  <p align="center">
    <a href="https://academy-space.vercel.app/" target="_blank">
      <img src="https://img.shields.io/badge/🚀_Live_Demo-Visit_Academy_Space-FA7436?style=for-the-badge&logoColor=white" alt="Live Demo" />
    </a>
  </p>

  <p>
    <b>Academy Space</b> adalah platform digital komprehensif untuk manajemen peminjaman fasilitas kampus.<br/>
    Dirancang untuk memberikan pengalaman reservasi yang <i>seamless</i>, transparan, dan efisien<br/>
    bagi seluruh civitas akademika — dari mahasiswa hingga administrator.
  </p>

</div>

<br/>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#️-technology-stack)
- [System Architecture](#-system-architecture)
- [Database Design](#️-database-design)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Docker Deployment](#-docker-deployment)
- [Testing](#-testing)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🌟 Overview

Academy Space hadir sebagai solusi paperless untuk proses peminjaman fasilitas kampus yang sebelumnya manual dan tidak efisien. Platform ini mengintegrasikan seluruh alur kerja — dari pencarian ruangan, pengajuan reservasi, proses approval oleh admin, hingga notifikasi real-time — dalam satu ekosistem digital yang modern.

### Permasalahan yang Diselesaikan

| Masalah Konvensional | Solusi Academy Space |
| :--- | :--- |
| Proses peminjaman menggunakan formulir kertas | Form digital dengan upload proposal |
| Tidak ada informasi ketersediaan real-time | Sistem pengecekan jadwal otomatis |
| Approval manual yang lambat | Workflow approval digital dengan notifikasi |
| Tidak ada riwayat peminjaman yang terorganisir | Dashboard dengan histori lengkap |
| Sulit memantau utilisasi fasilitas | Analytics dan pelaporan komprehensif |

---

## ✨ Key Features

### 👤 Fitur Pengguna (User)
- **🔐 Secure Authentication** — Registrasi dan login aman menggunakan JWT + Bcrypt hashing
- **🏢 Facility Browsing** — Katalog lengkap fasilitas kampus dengan foto, kapasitas, dan detail ruangan
- **📅 Smart Availability** — Pengecekan ketersediaan ruangan secara real-time dengan calendar view
- **📝 Reservation Management** — Pengajuan, edit, dan pembatalan reservasi dengan upload proposal
- **🔔 Real-time Notifications** — Notifikasi status pengajuan (Pending → Approved / Rejected)
- **👤 Profile Management** — Kelola profil, upload avatar, dan ubah password
- **🔍 Advanced Filtering** — Filter fasilitas berdasarkan tipe, gedung, kapasitas, dan ketersediaan

### 🛡️ Fitur Administrator
- **📊 Admin Dashboard** — Overview statistik: total users, facilities, reservations, pending approvals
- **✅ Approval System** — Setujui atau tolak reservasi dengan komentar dan audit trail
- **🏗️ Facility Management** — CRUD fasilitas, set maintenance mode, dan kelola gedung
- **👥 User Management** — Kelola pengguna: promote/demote role, suspend/unsuspend akun
- **📈 Analytics & Reporting** — Statistik utilisasi fasilitas, aktivitas pengguna, dan tren reservasi
- **🔧 System Tokens** — Manajemen token admin dan reset password

---

## 🛠️ Technology Stack

### Frontend (Client)

| Technology | Version | Purpose |
| :--- | :---: | :--- |
| [Next.js](https://nextjs.org/) | `16` | React framework dengan App Router & Server Components |
| [React](https://react.dev/) | `19` | Library UI untuk membangun antarmuka interaktif |
| [TypeScript](https://www.typescriptlang.org/) | `5` | Static typing untuk codebase yang lebih robust |
| [TailwindCSS](https://tailwindcss.com/) | `4` | Utility-first CSS framework untuk styling responsif |
| [Shadcn/UI](https://ui.shadcn.com/) | Latest | Komponen UI yang modular, aksesibel, berbasis Radix UI |
| [TanStack Query](https://tanstack.com/query) | `5` | Server state management & data fetching |
| [Zustand](https://zustand.docs.pmnd.rs/) | `5` | Lightweight client state management |
| [NextAuth.js](https://next-auth.js.org/) | `5 (Beta)` | Authentication solution untuk Next.js |
| [Chart.js](https://www.chartjs.org/) | `4` | Data visualization library untuk analytics |
| [React Hook Form](https://react-hook-form.com/) | `7` | Form management yang performant |
| [Zod](https://zod.dev/) | `4` | Schema validation untuk form & data |
| [Lucide React](https://lucide.dev/) | Latest | Icon library modern dan konsisten |

### Backend (Server)

| Technology | Version | Purpose |
| :--- | :---: | :--- |
| [Node.js](https://nodejs.org/) | `20` | JavaScript runtime environment |
| [Express](https://expressjs.com/) | `4` | Minimalist web framework untuk API |
| [TypeScript](https://www.typescriptlang.org/) | `5` | Static typing untuk backend |
| [PostgreSQL](https://www.postgresql.org/) | `15` | Database relasional utama |
| [Redis](https://redis.io/) | `5` | In-memory cache & session store |
| [JSON Web Token](https://jwt.io/) | `9` | Token-based authentication |
| [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js) | `2` | Password hashing library |
| [Zod](https://zod.dev/) | `3` | Request validation schema |
| [Helmet](https://helmetjs.github.io/) | `7` | HTTP security headers |
| [Winston](https://github.com/winstonjs/winston) | `3` | Structured logging library |
| [Multer](https://github.com/expressjs/multer) | `2` | File upload middleware |
| [Nodemailer](https://nodemailer.com/) | `8` | Email notification service |
| [Jest](https://jestjs.io/) | `30` | Testing framework |

### DevOps & Deployment

| Technology | Purpose |
| :--- | :--- |
| **Docker** & **Docker Compose** | Containerized deployment |
| **Railway** | Cloud deployment platform (Backend) |
| **Vercel** | Frontend deployment platform |
| **GitHub** | Version control & CI/CD |

---

## 🏛 System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Next.js 16)                         │
│                                                                      │
│  ┌─────────┐  ┌──────────────┐  ┌───────────┐  ┌──────────────────┐ │
│  │ App      │  │ Components   │  │ Hooks     │  │ State Management │ │
│  │ Router   │  │ (Shadcn/UI)  │  │ (Custom)  │  │ (Zustand +       │ │
│  │ Pages    │  │ BookingForm  │  │ useFaci.. │  │  TanStack Query) │ │
│  │          │  │ Calendar     │  │ useReser..│  │                  │ │
│  │          │  │ Navigation   │  │ useUsers  │  │                  │ │
│  └─────────┘  └──────────────┘  └───────────┘  └──────────────────┘ │
│                          │                                           │
│               ┌──────────┴──────────┐                                │
│               │  NextAuth.js v5     │                                │
│               │  (JWT + Credentials)│                                │
│               └──────────┬──────────┘                                │
│                          │  Axios + Interceptors                     │
└──────────────────────────┼───────────────────────────────────────────┘
                           │ HTTP/REST API
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      SERVER (Express + Node.js)                      │
│                                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────────┐   │
│  │ Middlewares  │  │  Routes      │  │  Controllers              │   │
│  │ ─ Auth JWT  │──│  /auth       │──│  authController           │   │
│  │ ─ Helmet    │  │  /facilities │  │  facilityController       │   │
│  │ ─ CORS     │  │  /reservat.. │  │  reservationController    │   │
│  │ ─ Rate Lmt │  │  /users      │  │  userController           │   │
│  │ ─ Validate │  │  /notificat..│  │  notificationController   │   │
│  │ ─ Upload   │  │  /dashboard  │  │  dashboardController      │   │
│  │ ─ Error    │  │  /upload     │  │  uploadController         │   │
│  └─────────────┘  │  /buildings  │  └───────────┬───────────────┘   │
│                    └──────────────┘              │                    │
│                                       ┌─────────▼───────────────┐   │
│                                       │  Services               │   │
│                                       │  (Business Logic Layer) │   │
│                                       └─────────┬───────────────┘   │
│                                       ┌─────────▼───────────────┐   │
│                                       │  Repositories           │   │
│                                       │  (Data Access Layer)    │   │
│                                       └─────────┬───────────────┘   │
└─────────────────────────────────────────────────┼────────────────────┘
                                                  │
                           ┌──────────────────────┼──────────┐
                           ▼                                  ▼
                ┌─────────────────────┐          ┌──────────────────┐
                │   PostgreSQL 15     │          │   Redis Alpine   │
                │   (Primary DB)      │          │   (Cache/Session)│
                │                     │          │                  │
                │  • users            │          │  • Rate limiting │
                │  • facilities       │          │  • Session cache │
                │  • reservations     │          │                  │
                │  • notifications    │          │                  │
                │  • approval_logs    │          │                  │
                │  • buildings        │          │                  │
                └─────────────────────┘          └──────────────────┘
```

Arsitektur ini mengikuti pola **Layered Architecture** dengan pemisahan yang jelas:

1. **Presentation Layer** — Next.js App Router + React Components
2. **API Layer** — Express Routes + Middleware Pipeline
3. **Business Logic Layer** — Services (validasi bisnis, orchestration)
4. **Data Access Layer** — Repositories (SQL queries, database interaction)
5. **Database Layer** — PostgreSQL (data persistence) + Redis (caching)

---

## 🗃️ Database Design

Berikut adalah Entity-Relationship Diagram dari database Academy Space:

```mermaid
erDiagram
    users ||--o{ reservations : "creates"
    users ||--o{ notifications : "receives"
    users ||--o{ approval_logs : "acts on"

    facility_types ||--o{ facilities : "categorizes"
    buildings ||--o{ facilities : "contains"

    reservations ||--o{ reservation_items : "has"
    reservations ||--o{ approval_logs : "reviewed via"
    reservations ||--o{ reservation_audit : "tracked by"
    reservations }o--|| reservation_statuses : "has status"

    facilities ||--o{ reservation_items : "reserved in"

    users {
        int user_id PK
        varchar username UK
        varchar password_hash
        varchar full_name
        user_role_enum role
        varchar profile_picture_url
        boolean is_suspended
        timestamptz created_at
        timestamptz last_login_at
    }

    facility_types {
        int type_id PK
        varchar name
        text description
    }

    buildings {
        int building_id PK
        varchar name
        varchar code
        text location_description
        varchar image_url
        timestamptz created_at
        timestamptz updated_at
    }

    facilities {
        int facility_id PK
        int type_id FK
        int building_id FK
        varchar name
        varchar room_number
        int capacity
        int floor
        text description
        varchar photo_url
        boolean is_active
        timestamptz maintenance_until
        timestamptz created_at
    }

    reservation_statuses {
        int status_id PK
        varchar name
        text description
    }

    reservations {
        int reservation_id PK
        int requester_id FK
        int status_id FK
        text purpose
        int attendees
        varchar proposal_url
        boolean is_canceled
        timestamptz created_at
        timestamptz updated_at
    }

    reservation_items {
        int item_id PK
        int reservation_id FK
        int facility_id FK
        timestamptz start_datetime
        timestamptz end_datetime
        timestamptz created_at
    }

    approval_logs {
        int approval_id PK
        int reservation_id FK
        int acted_by FK
        approval_action_enum action
        text comment
        timestamptz acted_at
    }

    reservation_audit {
        int audit_id PK
        int reservation_id FK
        int changed_by FK
        audit_change_enum change_type
        jsonb change_data
        timestamptz changed_at
    }

    notifications {
        int notification_id PK
        int user_id FK
        int reservation_id FK
        varchar title
        text message
        boolean is_read
        timestamptz created_at
    }
```

### Custom ENUM Types

| Enum | Values | Description |
| :--- | :--- | :--- |
| `user_role_enum` | `admin`, `user` | Role pengguna dalam sistem |
| `approval_action_enum` | `PENDING`, `APPROVED`, `REJECTED`, `CANCELED` | Status aksi approval |
| `audit_change_enum` | `CREATE`, `UPDATE`, `DELETE`, `CANCEL` | Tipe perubahan pada audit trail |

---

## 📡 API Documentation

Base URL: `http://localhost:5000/api`

### Authentication

| Method | Endpoint | Description | Auth |
| :---: | :--- | :--- | :---: |
| `POST` | `/auth/register` | Registrasi akun baru | ❌ |
| `POST` | `/auth/login` | Login dan mendapatkan JWT token | ❌ |
| `GET` | `/auth/me` | Mendapatkan data user yang sedang login | 🔑 |
| `POST` | `/auth/reset-password` | Reset password dengan system token | ❌ |

### Facilities

| Method | Endpoint | Description | Auth |
| :---: | :--- | :--- | :---: |
| `GET` | `/facilities` | List semua fasilitas (dengan filter & pagination) | ❌ |
| `GET` | `/facilities/:id` | Detail fasilitas berdasarkan ID | ❌ |
| `GET` | `/facilities/slug/:slug` | Detail fasilitas berdasarkan slug | ❌ |
| `GET` | `/facilities/:id/reservations` | Jadwal reservasi fasilitas tertentu | ❌ |
| `POST` | `/facilities` | Tambah fasilitas baru | 🔑 Admin |
| `PUT` | `/facilities/:id` | Update data fasilitas | 🔑 Admin |
| `DELETE` | `/facilities/:id` | Hapus fasilitas | 🔑 Admin |
| `PUT` | `/facilities/:id/maintenance` | Set mode maintenance | 🔑 Admin |
| `DELETE` | `/facilities/:id/maintenance` | Clear maintenance | 🔑 Admin |

### Reservations

| Method | Endpoint | Description | Auth |
| :---: | :--- | :--- | :---: |
| `POST` | `/reservations` | Buat reservasi baru | 🔑 |
| `GET` | `/reservations/my` | List reservasi milik user | 🔑 |
| `GET` | `/reservations` | List semua reservasi | 🔑 Admin |
| `GET` | `/reservations/:id` | Detail reservasi | 🔑 |
| `PUT` | `/reservations/:id` | Edit reservasi | 🔑 |
| `PUT` | `/reservations/:id/status` | Approve/Reject reservasi | 🔑 Admin |
| `DELETE` | `/reservations/:id` | Batalkan reservasi | 🔑 |

### Analytics & Dashboard

| Method | Endpoint | Description | Auth |
| :---: | :--- | :--- | :---: |
| `GET` | `/reservations/stats` | Statistik reservasi | 🔑 Admin |
| `GET` | `/reservations/utilization` | Utilisasi fasilitas | 🔑 Admin |
| `GET` | `/reservations/user-activity` | Aktivitas pengguna | 🔑 Admin |
| `GET` | `/dashboard/stats` | Overview dashboard stats | 🔑 Admin |

### User Management

| Method | Endpoint | Description | Auth |
| :---: | :--- | :--- | :---: |
| `GET` | `/users/profile` | Profil user sendiri | 🔑 |
| `PUT` | `/users/profile` | Update profil sendiri | 🔑 |
| `PUT` | `/users/profile/avatar` | Upload avatar (multipart) | 🔑 |
| `DELETE` | `/users/profile/avatar` | Hapus avatar | 🔑 |
| `GET` | `/users` | List semua user | 🔑 Admin |
| `POST` | `/users` | Buat user baru | 🔑 Admin |
| `GET` | `/users/:id` | Detail user | 🔑 Admin |
| `DELETE` | `/users/:id` | Hapus user | 🔑 Admin |
| `PUT` | `/users/:id/promote` | Promote ke admin | 🔑 Admin |
| `PUT` | `/users/:id/demote` | Demote ke user | 🔑 Admin |
| `PUT` | `/users/:id/suspend` | Suspend user | 🔑 Admin |
| `PUT` | `/users/:id/unsuspend` | Unsuspend user | 🔑 Admin |

### Other Endpoints

| Method | Endpoint | Description | Auth |
| :---: | :--- | :--- | :---: |
| `GET` | `/buildings` | List semua gedung | ❌ |
| `GET` | `/facility-types` | List tipe fasilitas | ❌ |
| `GET` | `/notifications` | Notifikasi user | 🔑 |
| `PUT` | `/notifications/:id/read` | Tandai notifikasi sudah dibaca | 🔑 |
| `POST` | `/upload` | Upload file (proposal/foto) | 🔑 |
| `GET` | `/health` | Health check endpoint | ❌ |

### API Response Format

Semua response mengikuti format standar:

```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": { ... }
}
```

Error Response:
```json
{
  "status": "error",
  "message": "Descriptive error message",
  "errors": [ ... ]
}
```

---

## 📁 Project Structure

```
academy-space/
├── 📁 client/                      # Frontend (Next.js 16)
│   ├── 📁 app/                     # App Router Pages
│   │   ├── 📁 AdminDashboard/      # Admin panel pages
│   │   │   ├── 📁 AnalyticsPage/
│   │   │   ├── 📁 ManageFacilitiesPage/
│   │   │   ├── 📁 ManageReservationsPage/
│   │   │   ├── 📁 SystemTokensPage/
│   │   │   ├── admin-layout-client.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── 📁 EditReservationPage/
│   │   ├── 📁 FacilityDetailPage/
│   │   ├── 📁 ForgotPasswordPage/
│   │   ├── 📁 GuidePage/
│   │   ├── 📁 LoginPage/
│   │   ├── 📁 MyReservationsPage/
│   │   ├── 📁 NotificationsPage/
│   │   ├── 📁 ProfilePage/
│   │   ├── 📁 RegisterPage/
│   │   ├── 📁 api/                 # API route handlers
│   │   ├── globals.css
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Landing page
│   ├── 📁 components/              # Reusable React components
│   │   ├── 📁 ui/                  # Shadcn/UI base components
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...more
│   │   ├── BookingForm.tsx         # Form peminjaman ruangan
│   │   ├── CalendarViewComponent.tsx
│   │   ├── ContactSection.tsx
│   │   ├── ExploreSection.tsx
│   │   ├── FacilitiesSection.tsx
│   │   ├── FacilityCard.tsx
│   │   ├── FilterComponent.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── Navigation.tsx
│   │   └── Providers.tsx           # NextAuth + React Query providers
│   ├── 📁 hooks/                   # Custom React hooks
│   │   ├── useFacilities.ts
│   │   ├── useReservations.ts
│   │   └── useUsers.ts
│   ├── 📁 lib/                     # Utilities & configurations
│   │   ├── api.ts                  # Axios instance + interceptors
│   │   ├── env.ts
│   │   ├── store.ts                # Zustand store
│   │   └── utils.ts
│   ├── 📁 types/                   # TypeScript type definitions
│   ├── 📁 public/                  # Static assets
│   ├── auth.ts                     # NextAuth configuration
│   ├── Dockerfile
│   ├── next.config.ts
│   └── package.json
│
├── 📁 server/                      # Backend (Express + Node.js)
│   ├── 📁 src/
│   │   ├── 📁 config/              # Environment & app config
│   │   │   └── env.ts              # Zod-validated env variables
│   │   ├── 📁 controllers/         # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── facilityController.ts
│   │   │   ├── reservationController.ts
│   │   │   ├── userController.ts
│   │   │   ├── notificationController.ts
│   │   │   ├── dashboardController.ts
│   │   │   ├── buildingController.ts
│   │   │   ├── facilityTypeController.ts
│   │   │   └── uploadController.ts
│   │   ├── 📁 services/            # Business logic layer
│   │   │   ├── facilityService.ts
│   │   │   ├── reservationService.ts
│   │   │   ├── userService.ts
│   │   │   └── notificationService.ts
│   │   ├── 📁 repositories/        # Data access layer
│   │   │   ├── BaseRepository.ts
│   │   │   ├── FacilityRepository.ts
│   │   │   ├── ReservationRepository.ts
│   │   │   ├── UserRepository.ts
│   │   │   ├── NotificationRepository.ts
│   │   │   ├── BuildingRepository.ts
│   │   │   └── FacilityTypeRepository.ts
│   │   ├── 📁 routes/              # API route definitions
│   │   │   ├── index.ts            # Route aggregator
│   │   │   ├── authRoutes.ts
│   │   │   ├── facilityRoutes.ts
│   │   │   ├── reservationRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   ├── notificationRoutes.ts
│   │   │   ├── dashboardRoutes.ts
│   │   │   ├── buildingRoutes.ts
│   │   │   ├── facilityTypeRoutes.ts
│   │   │   └── uploadRoutes.ts
│   │   ├── 📁 middlewares/          # Express middlewares
│   │   │   ├── authMiddleware.ts    # JWT authentication
│   │   │   ├── errorHandler.ts     # Global error handler
│   │   │   ├── rateLimiter.ts      # Rate limiting
│   │   │   ├── uploadMiddleware.ts  # File upload (Multer)
│   │   │   └── validate.ts         # Zod schema validation
│   │   ├── 📁 schemas/             # Request validation schemas
│   │   │   ├── auth.schema.ts
│   │   │   ├── facility.schema.ts
│   │   │   ├── reservation.schema.ts
│   │   │   └── user.schema.ts
│   │   ├── 📁 db/                  # Database management
│   │   │   ├── index.ts            # Pool connection
│   │   │   ├── schema.sql          # Full database schema
│   │   │   ├── migrate.ts          # Migration runner
│   │   │   ├── seed.ts             # Data seeding
│   │   │   ├── setup.ts            # Schema initialization
│   │   │   ├── redis.ts            # Redis client
│   │   │   └── 📁 migrations/      # SQL migration files
│   │   ├── 📁 utils/               # Utility functions
│   │   │   ├── AppError.ts         # Custom error class
│   │   │   ├── catchAsync.ts       # Async error wrapper
│   │   │   ├── logger.ts           # Winston logger
│   │   │   ├── response.ts         # Standardized responses
│   │   │   └── imageProcessor.ts   # Image handling
│   │   ├── 📁 types/               # TypeScript types
│   │   ├── app.ts                  # Express app setup
│   │   └── index.ts                # Server entry point
│   ├── 📁 tests/
│   │   ├── 📁 unit/                # Unit tests
│   │   │   ├── authController.test.ts
│   │   │   ├── FacilityController.test.ts
│   │   │   └── ReservationController.test.ts
│   │   ├── 📁 integration/         # Integration tests
│   │   │   └── ReservationFlow.test.ts
│   │   └── setup.ts                # Test setup
│   ├── Dockerfile
│   ├── jest.config.cjs
│   └── package.json
│
├── 📁 docs/                        # Project documentation
│   ├── 📁 DPPL_AcademySpace/       # Deskripsi Perancangan Perangkat Lunak
│   ├── 📁 DUPL_AcademySpace/       # Dokumen Uji Perangkat Lunak
│   ├── 📁 UAT_AcademySpace/        # User Acceptance Testing
│   ├── UML_Class_Diagram.md
│   ├── UML_Class_Diagram.puml
│   └── ...more documentation
│
├── docker-compose.yml              # Multi-container Docker setup
├── deploy.sh                       # Deployment automation script
├── railway.json                    # Railway deployment config
├── package.json                    # Monorepo root scripts
└── .gitignore
```

---

## ⚙️ Prerequisites

Pastikan environment Anda telah memenuhi syarat berikut sebelum instalasi:

| Software | Version | Required |
| :--- | :---: | :---: |
| [Node.js](https://nodejs.org/) | `≥ 20.x` | ✅ |
| [npm](https://www.npmjs.com/) | `≥ 10.x` | ✅ |
| [PostgreSQL](https://www.postgresql.org/) | `≥ 15.x` | ✅ |
| [Redis](https://redis.io/) | `Latest` | ⚡ Optional |
| [Docker](https://www.docker.com/) | `Latest` | ⚡ Optional |
| [Git](https://git-scm.com/) | `Latest` | ✅ |

---

## 🚀 Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/mhmmdragilpy/AcademySpace.git
cd AcademySpace
```

### 2. Install Dependencies

Gunakan script monorepo untuk install semua dependencies sekaligus:

```bash
# Install semua dependencies (root + server + client)
npm run install:all
```

Atau install secara manual:

```bash
# Server dependencies
cd server && npm install

# Client dependencies
cd ../client && npm install
```

### 3. Environment Configuration

#### Server (`server/.env`)

```env
# Application
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/academy_space

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your_super_secret_jwt_key_minimum_10_chars

# CORS
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

#### Client (`client/.env`)

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# NextAuth
AUTH_SECRET=your_nextauth_secret_key
AUTH_URL=http://localhost:3000
```

### 4. Database Setup

```bash
cd server

# Buat database PostgreSQL terlebih dahulu
# psql -U postgres -c "CREATE DATABASE academy_space;"

# Jalankan schema setup (membuat semua tabel)
npx tsx src/db/setup.ts

# Seed data awal (data dummy untuk testing)
npm run seed
```

### 5. Jalankan Migrasi (opsional, jika ada migration baru)

```bash
cd server
npx tsx src/db/migrate.ts
```

---

## 🏃 Running the Application

### Development Mode (Concurrent)

Jalankan backend dan frontend bersamaan dari root directory:

```bash
npm run dev
```

### Development Mode (Terpisah)

**Terminal 1 — Backend Server:**
```bash
cd server
npm run dev
# ✅ Server running at http://localhost:5000
```

**Terminal 2 — Frontend Client:**
```bash
cd client
npm run dev
# ✅ App available at http://localhost:3000
```

### Production Build

```bash
npm run build    # Build server + client
npm start        # Start production server
```

---

## 🐳 Docker Deployment

### Quick Start dengan Docker Compose

```bash
# Build dan jalankan semua services
docker-compose up -d --build

# Jalankan migrasi database
docker exec academy_space_backend_prod node dist/db/migrate.js

# Lihat logs
docker-compose logs -f
```

### Services yang Berjalan

| Service | Container | Port | Description |
| :--- | :--- | :---: | :--- |
| **Frontend** | `academy_space_frontend_prod` | `3000` | Next.js application |
| **Backend** | `academy_space_backend_prod` | `5000` | Express API server |
| **PostgreSQL** | `academy_space_db_prod` | `5432` | Database (internal) |
| **Redis** | `academy_space_redis_prod` | `6379` | Cache (internal) |

### Docker Architecture

```
                    ┌─── frontend_network ───┐
                    │                        │
              ┌─────┴──────┐          ┌──────┴──────┐
              │  Frontend  │          │   Backend   │
              │  :3000     │          │   :5000     │
              └────────────┘          └──────┬──────┘
                                             │
                                    ┌── backend_network ──┐
                                    │         │           │
                              ┌─────┴───┐  ┌──┴──────────┐
                              │ Postgres │  │    Redis    │
                              │ :5432    │  │    :6379    │
                              └─────────┘  └─────────────┘
```

> **Note:** Database dan Redis berjalan di `backend_network` (internal) dan tidak dapat diakses langsung dari luar.

### Deployment Otomatis

```bash
# Gunakan script deploy
chmod +x deploy.sh
./deploy.sh
```

---

## 🧪 Testing

### Menjalankan Tests

```bash
cd server

# Jalankan semua tests
npm test

# Watch mode
npm run test:watch

# Dengan coverage report
npm run test:coverage
```

### Test Structure

```
server/tests/
├── unit/
│   ├── authController.test.ts          # Auth login/register tests
│   ├── FacilityController.test.ts      # Facility CRUD tests
│   └── ReservationController.test.ts   # Reservation flow tests
├── integration/
│   └── ReservationFlow.test.ts         # End-to-end reservation flow
└── setup.ts                            # Test environment config
```

### Test Database Connection

```bash
cd server
npm run test-db    # Verifikasi koneksi database
```

---

## 🔐 Environment Variables

### Server Environment Variables

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | ❌ | `development` | Environment mode |
| `PORT` | ❌ | `5000` | Server port |
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `REDIS_URL` | ❌ | — | Redis connection string |
| `JWT_SECRET` | ✅ | — | Secret key untuk JWT (min 10 chars) |
| `FRONTEND_URL` | ❌ | `http://localhost:3000` | Frontend URL untuk CSP |
| `CORS_ORIGIN` | ❌ | `http://localhost:3000` | Allowed CORS origin |

### Client Environment Variables

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | ❌ | `http://localhost:5000/api` | Backend API base URL |
| `AUTH_SECRET` | ✅ | — | NextAuth.js secret key |

---

## 📸 Screenshots

> *Visualisasi antarmuka aplikasi Academy Space*

| **Landing Page** | **Facility Exploration** |
| :---: | :---: |
| Hero section dengan navigasi intuitif | Katalog fasilitas dengan filter & search |

| **Booking Form** | **Calendar View** |
| :---: | :---: |
| Form reservasi dengan validasi lengkap | Tampilan kalender ketersediaan ruangan |

| **Admin Dashboard** | **Reservation Management** |
| :---: | :---: |
| Overview statistik dan quick actions | Approve/Reject reservasi dengan comments |

---

## 🤝 Contributing

Kontribusi selalu diterima! Berikut langkah-langkah untuk berkontribusi:

1. **Fork** repository ini
2. **Buat branch** fitur baru
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit** perubahan Anda
   ```bash
   git commit -m "feat: add AmazingFeature"
   ```
4. **Push** ke branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Buka **Pull Request**

### Commit Convention

Project ini mengikuti [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Description |
| :--- | :--- |
| `feat:` | Fitur baru |
| `fix:` | Bug fix |
| `docs:` | Perubahan dokumentasi |
| `style:` | Formatting (tanpa perubahan logika) |
| `refactor:` | Refactoring kode |
| `test:` | Menambah/memperbaiki tests |
| `chore:` | Maintenance tasks |

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 👤 Author

<div align="center">

  **Developed with ❤️ by Mang Do-san**

  [![GitHub](https://img.shields.io/badge/GitHub-mhmmdragilpy-181717?style=for-the-badge&logo=github)](https://github.com/mhmmdragilpy)

</div>

---

<div align="center">
  <sub>⭐ Jika project ini bermanfaat, silakan berikan bintang di GitHub!</sub>
</div>
