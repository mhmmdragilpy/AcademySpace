# PlantUML Sequence Diagrams - Academy Space

Dokumentasi Sequence Diagram UML untuk sistem Academy Space.

## 📋 Daftar Diagram

### User Use Cases (11 diagrams)

| FR | Nama Use Case | File |
|----|---------------|------|
| FR-01 | Membuat atau Masuk Akun | [FR-01-Membuat_atau_Masuk_Akun.puml](FR-01-Membuat_atau_Masuk_Akun.puml) |
| FR-02 | Mengelola Profil | [FR-02-Mengelola_Profil.puml](FR-02-Mengelola_Profil.puml) |
| FR-03 | Mengajukan Reservasi | [FR-03-Mengajukan_Reservasi.puml](FR-03-Mengajukan_Reservasi.puml) |
| FR-04 | Melihat Jadwal dan Ketersediaan | [FR-04-Melihat_Jadwal_dan_Ketersediaan_Fasilitas.puml](FR-04-Melihat_Jadwal_dan_Ketersediaan_Fasilitas.puml) |
| FR-05 | Menerima Notifikasi | [FR-05-Menerima_Notifikasi_Approval_Rejection.puml](FR-05-Menerima_Notifikasi_Approval_Rejection.puml) |
| FR-06 | Mencari Fasilitas | [FR-06-Mencari_Fasilitas.puml](FR-06-Mencari_Fasilitas.puml) |
| FR-07 | Melihat Detail Ruangan | [FR-07-Melihat_Detail_Ruangan.puml](FR-07-Melihat_Detail_Ruangan.puml) |
| FR-08 | Mengedit atau Membatalkan Reservasi | [FR-08-Mengedit_atau_Membatalkan_Reservasi.puml](FR-08-Mengedit_atau_Membatalkan_Reservasi.puml) |
| FR-10 | Melihat Riwayat Reservasi | [FR-10-Melihat_Riwayat_Reservasi.puml](FR-10-Melihat_Riwayat_Reservasi.puml) |
| FR-12 | Menyaring Pencarian Fasilitas | [FR-12-Menyaring_Pencarian_Fasilitas.puml](FR-12-Menyaring_Pencarian_Fasilitas.puml) |
| FR-16 | Melihat Guide Penggunaan | [FR-16-Melihat_Guide_Penggunaan_Website.puml](FR-16-Melihat_Guide_Penggunaan_Website.puml) |
| EXT | Mereset Password | [EXT-Mereset_Password.puml](EXT-Mereset_Password.puml) |

### Admin Use Cases (6 diagrams)

| FR | Nama Use Case | File |
|----|---------------|------|
| FR-09 | Menyetujui atau Menolak Reservasi | [FR-09-Menyetujui_atau_Menolak_Reservasi.puml](FR-09-Menyetujui_atau_Menolak_Reservasi.puml) |
| FR-11 | Mengelola Fasilitas | [FR-11-Mengelola_Fasilitas.puml](FR-11-Mengelola_Fasilitas.puml) |
| FR-13 | Melihat Detail Reservasi | [FR-13-Melihat_Detail_Reservasi.puml](FR-13-Melihat_Detail_Reservasi.puml) |
| FR-14 | Melihat Jadwal Reservasi | [FR-14-Melihat_Jadwal_Reservasi.puml](FR-14-Melihat_Jadwal_Reservasi.puml) |
| FR-15 | Mengambil Token Sistem | [FR-15-Mengambil_Token_Sistem.puml](FR-15-Mengambil_Token_Sistem.puml) |
| FR-17 | Melihat Analitik dan Pelaporan | [FR-17-Melihat_Analitik_dan_Pelaporan.puml](FR-17-Melihat_Analitik_dan_Pelaporan.puml) |

## 📐 Symbol UML yang Digunakan

### Tipe Objek (Lifeline Symbols)

| Symbol | Keyword | Deskripsi | Contoh |
|--------|---------|-----------|--------|
| 🧑 | `actor` | Aktor/pengguna sistem | User, Admin |
| ⭕ | `boundary` | Antarmuka/UI (Interface) | LoginPage, HomePage |
| 🔄 | `control` | Logic/Controller | AuthController, ReservationController |
| 📦 | `entity` | Data/Database | UserDB, ReservationDB |

### Notasi Pesan

| Notasi | Arti |
|--------|------|
| `->` | Synchronous message (panggilan) |
| `-->` | Return message (balasan) |
| `activate` | Objek mulai memproses (activation bar) |
| `deactivate` | Objek selesai memproses |

### Fragment yang Digunakan

| Fragment | Kegunaan |
|----------|----------|
| `alt...else` | Percabangan kondisional (if-else) |
| `opt` | Operasi opsional |
| `loop` | Perulangan |
| `par` | Eksekusi paralel |
| `note` | Catatan penjelasan |

## 🎨 Contoh Deklarasi Objek

```plantuml
' Aktor
actor "User" as User
actor "Admin" as Admin

' Boundary (UI/Interface) - Simbol lingkaran dengan garis vertikal
boundary "LoginPage" as LogPage
boundary "HomePage" as HomePage

' Control (Controller/Service) - Simbol lingkaran dengan panah
control "AuthController" as AuthCtrl
control "ReservationController" as ResCtrl

' Entity (Database) - Simbol lingkaran dengan garis bawah
entity "UserDB" as UserDB
entity "ReservationDB" as ResDB
```

## 🛠 Cara Render Diagram

### Menggunakan PlantUML Online

1. Buka [PlantUML Web Server](http://www.plantuml.com/plantuml/uml/)
2. Copy-paste isi file `.puml`
3. Klik "Submit" untuk generate diagram

### Menggunakan VS Code

1. Install extension "PlantUML"
2. Buka file `.puml`
3. Tekan `Alt+D` untuk preview

### Menggunakan Command Line

```bash
# Install PlantUML (membutuhkan Java)
# Download plantuml.jar dari https://plantuml.com/download

# Generate PNG
java -jar plantuml.jar FR-01-Membuat_atau_Masuk_Akun.puml

# Generate SVG
java -jar plantuml.jar -tsvg FR-01-Membuat_atau_Masuk_Akun.puml

# Generate semua diagram
java -jar plantuml.jar *.puml
```

## 📁 Struktur Folder

```
PlanUML-Sequence-Diagram/
├── README.md
├── FR-01-Membuat_atau_Masuk_Akun.puml
├── FR-02-Mengelola_Profil.puml
├── FR-03-Mengajukan_Reservasi.puml
├── FR-04-Melihat_Jadwal_dan_Ketersediaan_Fasilitas.puml
├── FR-05-Menerima_Notifikasi_Approval_Rejection.puml
├── FR-06-Mencari_Fasilitas.puml
├── FR-07-Melihat_Detail_Ruangan.puml
├── FR-08-Mengedit_atau_Membatalkan_Reservasi.puml
├── FR-09-Menyetujui_atau_Menolak_Reservasi.puml
├── FR-10-Melihat_Riwayat_Reservasi.puml
├── FR-11-Mengelola_Fasilitas.puml
├── FR-12-Menyaring_Pencarian_Fasilitas.puml
├── FR-13-Melihat_Detail_Reservasi.puml
├── FR-14-Melihat_Jadwal_Reservasi.puml
├── FR-15-Mengambil_Token_Sistem.puml
├── FR-16-Melihat_Guide_Penggunaan_Website.puml
├── FR-17-Melihat_Analitik_dan_Pelaporan.puml
└── EXT-Mereset_Password.puml
```

## 📚 Referensi

- [PlantUML Sequence Diagram](https://plantuml.com/sequence-diagram)
- [PlantUML Creole](https://plantuml.com/creole)
- [UML Sequence Diagram Tutorial](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-sequence-diagram/)
