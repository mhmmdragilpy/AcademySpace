/*
 * ==================================
 * FILE: server/src/index.ts (FINAL BACKEND UPDATE)
 * ==================================
 */

// 1. Import Dependencies
import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { Pool, QueryResult } from 'pg';

// Impor SEMUA rute kita
import authRoutes from './routes/authRoutes';
import facilityRoutes from './routes/facilityRoutes';
import reservationRoutes from './routes/reservationRoutes';
import adminRoutes from './routes/adminRoutes';
import equipmentRoutes from './routes/equipmentRoutes'; // <-- INI DIA DIAKTIFKAN

// 2. Setup Aplikasi Express
const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);

// 3. Setup Middleware
app.use(cors());
app.use(express.json());

// 4. Setup Koneksi Database
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Cek koneksi database saat server start (dengan tipe yang benar)
pool.query('SELECT NOW()', (err: Error, res: QueryResult) => {
  if (err) {
    console.error('🔴 Error koneksi ke database:', err.stack);
  } else {
    console.log('🟢 Koneksi database PostgreSQL berhasil pada:', res.rows[0].now);
  }
});

// 5. Setup Routes (Rute)
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Selamat datang di Academy Space API! 🚀 (TypeScript Version)' });
});

// Rute Publik & User
app.use('/api/auth', authRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/reservations', reservationRoutes);

// Rute Khusus Admin
app.use('/api/admin', adminRoutes);
app.use('/api/equipment', equipmentRoutes); // <-- BARIS INI DIAKTIFKAN

// 6. Jalankan Server
app.listen(PORT, () => {
  console.log(`Server backend berjalan di http://localhost:${PORT}`);
});

// 7. Export 'pool'
export { pool };
