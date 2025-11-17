# 🏛️ Academy Spaces - Backend API

Selamat datang di API untuk Academy Spaces, sistem reservasi fasilitas kampus modern. Backend ini dibangun menggunakan Node.js, Express, dan TypeScript, menyediakan REST API yang tangguh dan aman untuk aplikasi frontend.

## ✨ Fitur Utama

- **Otentikasi & Otorisasi:** Sistem login aman menggunakan JSON Web Tokens (JWT) dengan perbedaan hak akses antara `USER` dan `ADMIN`.
- **Manajemen Fasilitas:** Operasi CRUD (Create, Read, Update, Delete) lengkap untuk mengelola fasilitas, ruangan, dan laboratorium.
- **Manajemen Peralatan:** Operasi CRUD untuk semua peralatan yang terkait dengan fasilitas.
- **Alur Reservasi:** Logika untuk membuat, melihat, membatalkan, menyetujui, dan menolak reservasi.
- **Penanganan Error Terstruktur:** Menggunakan error class kustom (`AppError`) untuk mengirimkan pesan error yang konsisten dan dapat diprediksi, yang mudah ditangani oleh frontend.

```typescript
// Contoh konsistensi penanganan error di semua controller
try {
  // ... logika bisnis ...
  return res.json({
    message: 'Login berhasil',
    data, 
  });
} catch (err) {
  if (err instanceof AppError) {
    // Error yang diprediksi (mis: 'Kredensial tidak valid')
    return res.status(err.statusCode).json({ message: err.message });
  }
  // Error tak terduga (bug)
  console.error(err);
  return res.status(500).send('Server error');
}
```

## 🚀 Teknologi yang Digunakan

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Validasi:** [Zod](https://zod.dev/) untuk validasi skema input.

## ⚙️ Menjalankan Server di Lokal

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Konfigurasi Environment:**
    Buat file `.env` di root direktori `server/` dan isi dengan URL koneksi database PostgreSQL Anda. Gunakan `.env.example` sebagai template.
    ```
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    JWT_SECRET="RAHASIA_ANDA"
    ```

3.  **Migrasi Database:**
    Jalankan migrasi Prisma untuk membuat skema database sesuai dengan model.
    ```bash
    npx prisma migrate dev --name init
    ```

4.  **Jalankan Development Server:**
    Server akan berjalan di `http://localhost:5000` dengan hot-reload.
    ```bash
    npm run dev
    ```

---
*Dibuat untuk sistem reservasi kampus yang efisien dan modern.*