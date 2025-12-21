# 📊 AcademySpace - UML Class Diagram Documentation

**Last Updated:** December 21, 2025

## 📋 Overview

Dokumen ini menjelaskan struktur UML Class Diagram untuk aplikasi **AcademySpace** - Sistem Reservasi Fasilitas Kampus.

---

## 🗂️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ Controllers  │ │ Middlewares  │ │ Routes                   │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                      BUSINESS LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     Services                              │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      DATA ACCESS LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Repositories                            │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      DATABASE LAYER                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ PostgreSQL   │ │ Redis Cache  │ │ Domain Entities          │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Domain Entities

### 1. **User** (Pengguna)
| Attribute | Type | Description |
|-----------|------|-------------|
| `user_id` | INT (PK) | Primary Key |
| `username` | VARCHAR | Username unik |
| `password_hash` | VARCHAR | Password terenkripsi |
| `full_name` | VARCHAR | Nama lengkap |
| `role` | ENUM | 'admin' atau 'user' |
| `profile_picture_url` | VARCHAR | URL foto profil |
| `is_suspended` | BOOLEAN | Status suspended |
| `created_at` | TIMESTAMP | Waktu pembuatan |
| `last_login_at` | TIMESTAMP | Waktu login terakhir |

### 2. **Building** (Gedung)
| Attribute | Type | Description |
|-----------|------|-------------|
| `building_id` | INT (PK) | Primary Key |
| `name` | VARCHAR | Nama gedung |
| `code` | VARCHAR | Kode gedung |
| `location_description` | TEXT | Deskripsi lokasi |
| `image_url` | VARCHAR | URL gambar gedung |
| `created_at` | TIMESTAMP | Waktu pembuatan |
| `updated_at` | TIMESTAMP | Waktu update |

### 3. **FacilityType** (Tipe Fasilitas)
| Attribute | Type | Description |
|-----------|------|-------------|
| `type_id` | INT (PK) | Primary Key |
| `name` | VARCHAR | Nama tipe |
| `description` | TEXT | Deskripsi tipe |

### 4. **Facility** (Fasilitas/Ruangan)
| Attribute | Type | Description |
|-----------|------|-------------|
| `facility_id` | INT (PK) | Primary Key |
| `type_id` | INT (FK) | Referensi ke FacilityType |
| `building_id` | INT (FK) | Referensi ke Building |
| `name` | VARCHAR | Nama fasilitas |
| `room_number` | VARCHAR | Nomor ruangan |
| `capacity` | INT | Kapasitas |
| `floor` | INT | Lantai |
| `description` | TEXT | Deskripsi |
| `layout_description` | TEXT | Layout ruangan |
| `photo_url` | VARCHAR | URL foto |
| `is_active` | BOOLEAN | Status aktif |
| `maintenance_until` | TIMESTAMP | Maintenance sampai |
| `maintenance_reason` | TEXT | Alasan maintenance |

### 5. **ReservationStatus** (Status Reservasi)
| Attribute | Type | Description |
|-----------|------|-------------|
| `status_id` | INT (PK) | Primary Key |
| `name` | VARCHAR | Nama status |
| `description` | TEXT | Deskripsi |

**Status Values:**
- `PENDING` - Menunggu persetujuan
- `APPROVED` - Disetujui
- `REJECTED` - Ditolak
- `CANCELED` - Dibatalkan

### 6. **Reservation** (Reservasi)
| Attribute | Type | Description |
|-----------|------|-------------|
| `reservation_id` | INT (PK) | Primary Key |
| `requester_id` | INT (FK) | Referensi ke User |
| `status_id` | INT (FK) | Referensi ke ReservationStatus |
| `purpose` | TEXT | Tujuan reservasi |
| `attendees` | INT | Jumlah peserta |
| `proposal_url` | VARCHAR | URL proposal |
| `is_canceled` | BOOLEAN | Status pembatas |
| `created_at` | TIMESTAMP | Waktu pembuatan |
| `updated_at` | TIMESTAMP | Waktu update |

### 7. **ReservationItem** (Item Reservasi)
| Attribute | Type | Description |
|-----------|------|-------------|
| `item_id` | INT (PK) | Primary Key |
| `reservation_id` | INT (FK) | Referensi ke Reservation |
| `facility_id` | INT (FK) | Referensi ke Facility |
| `start_datetime` | TIMESTAMP | Waktu mulai |
| `end_datetime` | TIMESTAMP | Waktu selesai |
| `created_at` | TIMESTAMP | Waktu pembuatan |

**Constraints:**
- `end_datetime > start_datetime`
- `facility_id IS NOT NULL`

### 8. **ApprovalLog** (Log Persetujuan)
| Attribute | Type | Description |
|-----------|------|-------------|
| `approval_id` | INT (PK) | Primary Key |
| `reservation_id` | INT (FK) | Referensi ke Reservation |
| `acted_by` | INT (FK) | Referensi ke User (Admin) |
| `action` | ENUM | PENDING/APPROVED/REJECTED/CANCELED |
| `comment` | TEXT | Komentar |
| `acted_at` | TIMESTAMP | Waktu aksi |

### 9. **ReservationAudit** (Audit Trail)
| Attribute | Type | Description |
|-----------|------|-------------|
| `audit_id` | INT (PK) | Primary Key |
| `reservation_id` | INT (FK) | Referensi ke Reservation |
| `changed_by` | INT (FK) | Referensi ke User |
| `change_type` | ENUM | CREATE/UPDATE/DELETE/CANCEL |
| `change_data` | JSONB | Data perubahan |
| `changed_at` | TIMESTAMP | Waktu perubahan |

### 10. **Notification** (Notifikasi)
| Attribute | Type | Description |
|-----------|------|-------------|
| `notification_id` | INT (PK) | Primary Key |
| `user_id` | INT (FK) | Referensi ke User |
| `reservation_id` | INT (FK) | Referensi ke Reservation |
| `title` | VARCHAR | Judul notifikasi |
| `message` | TEXT | Isi pesan |
| `is_read` | BOOLEAN | Status dibaca |
| `status_id` | INT (FK) | Referensi ke ReservationStatus |
| `created_at` | TIMESTAMP | Waktu pembuatan |

### 11. **Rating** (Rating & Review)
| Attribute | Type | Description |
|-----------|------|-------------|
| `rating_id` | INT (PK) | Primary Key |
| `user_id` | INT (FK) | Referensi ke User |
| `facility_id` | INT (FK) | Referensi ke Facility |
| `reservation_id` | INT (FK) | Referensi ke Reservation |
| `rating` | INT | Nilai 1-5 |
| `review` | TEXT | Ulasan |
| `created_at` | TIMESTAMP | Waktu pembuatan |

**Constraints:**
- `rating >= 1 AND rating <= 5`

### 12. **SystemToken** (Token Sistem)
| Attribute | Type | Description |
|-----------|------|-------------|
| `key` | VARCHAR (PK) | Primary Key |
| `value` | VARCHAR | Nilai token |
| `description` | TEXT | Deskripsi |

---

## 🔗 Entity Relationships

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   User      │────<│ Reservation  │>────│ReservationItem│
└─────────────┘     └──────────────┘     └───────────────┘
      │                    │                     │
      │                    │                     │
      ▼                    ▼                     ▼
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│ Notification│     │ ApprovalLog  │     │   Facility    │
└─────────────┘     └──────────────┘     └───────────────┘
      │                                         │
      │                                         │
      ▼                                         ▼
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   Rating    │     │    Building  │─────│ FacilityType  │
└─────────────┘     └──────────────┘     └───────────────┘
```

### Relationships Description:
- **User → Reservation**: One-to-Many (1 User can have many Reservations)
- **User → Notification**: One-to-Many (1 User can have many Notifications)
- **User → Rating**: One-to-Many (1 User can write many Ratings)
- **User → ApprovalLog**: One-to-Many (Admin acts on many Reservations)
- **Facility → FacilityType**: Many-to-One (Many Facilities belong to 1 Type)
- **Facility → Building**: Many-to-One (Many Facilities in 1 Building)
- **Reservation → ReservationItem**: One-to-Many (1 Reservation has many Items)
- **Reservation → ReservationStatus**: Many-to-One (Many Reservations share Status)
- **ReservationItem → Facility**: Many-to-One (Many Items reference 1 Facility)
- **Facility → Rating**: One-to-Many (1 Facility has many Ratings)

---

## 🏗️ Layer Architecture

### 1. Controllers (Presentation Layer)

| Controller | Endpoints | Description |
|------------|-----------|-------------|
| **AuthController** | `/auth/*` | Register, Login, GetMe, ResetPassword |
| **UserController** | `/users/*` | CRUD Users, Profile, Suspend/Unsuspend |
| **FacilityController** | `/facilities/*` | CRUD Facilities, Maintenance |
| **BuildingController** | `/buildings/*` | Get All Buildings |
| **FacilityTypeController** | `/facility-types/*` | Get All Types |
| **ReservationController** | `/reservations/*` | CRUD Reservations, Stats |
| **NotificationController** | `/notifications/*` | CRUD Notifications |
| **RatingController** | `/ratings/*` | CRUD Ratings |
| **DashboardController** | `/dashboard/*` | Dashboard Stats |
| **UploadController** | `/upload/*` | File Upload |

### 2. Services (Business Logic Layer)

| Service | Functions |
|---------|-----------|
| **UserService** | User management, authentication validation |
| **FacilityService** | Facility CRUD, availability checking |
| **ReservationService** | Reservation workflow, conflict detection |
| **NotificationService** | Notification management |
| **RatingService** | Rating and review management |

### 3. Repositories (Data Access Layer)

| Repository | Entity |
|------------|--------|
| **UserRepository** | User |
| **FacilityRepository** | Facility |
| **BuildingRepository** | Building |
| **FacilityTypeRepository** | FacilityType |
| **ReservationRepository** | Reservation, ReservationItem |
| **NotificationRepository** | Notification |
| **RatingRepository** | Rating |

---

## 📊 Viewing the UML Diagram

### Option 1: PlantUML Online
1. Buka [PlantUML Online Server](https://www.plantuml.com/plantuml/uml/)
2. Copy paste isi file `UML_Class_Diagram.puml`
3. Diagram akan ter-render otomatis

### Option 2: VS Code Extension
1. Install extension "PlantUML"
2. Buka file `UML_Class_Diagram.puml`
3. Press `Alt+D` untuk preview

### Option 3: Generate PNG/SVG
```bash
# Install PlantUML
npm install -g node-plantuml

# Generate PNG
puml generate docs/UML_Class_Diagram.puml -o docs/

# Or using jar
java -jar plantuml.jar docs/UML_Class_Diagram.puml
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, TypeScript, TailwindCSS |
| **Backend** | Express.js, TypeScript |
| **Database** | PostgreSQL |
| **Cache** | Redis |
| **Authentication** | JWT |
| **Validation** | Zod |
| **ORM/Query** | Raw SQL (pg driver) |

---

## 📝 Notes

1. **Pattern**: Repository Pattern dengan layered architecture
2. **Caching**: Redis digunakan untuk cache facility data
3. **Audit Trail**: Semua perubahan reservation di-log ke `reservation_audit`
4. **Soft Delete**: Reservation menggunakan `is_canceled` flag
5. **Timestamps**: Semua tabel menggunakan `timestamptz` untuk timezone support

---

## 📄 File Location

- **PlantUML Source**: `docs/UML_Class_Diagram.puml`
- **Documentation**: `docs/UML_Class_Diagram.md`

