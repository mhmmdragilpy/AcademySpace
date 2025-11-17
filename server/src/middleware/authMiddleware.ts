/*
 * ================================================
 * FILE: server/src/middleware/authMiddleware.ts (UPDATE)
 * ================================================
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

// Tipe data untuk payload token kita
// (Ini harusnya sudah ada dari file 'server/src/types/express.d.ts')
interface TokenPayload {
  user: {
    id: number;
    email: string;
    role: string; // 'admin', 'staff', atau 'user'
  };
}

/**
 * Middleware "protect" (Penjaga Gerbang)
 *
 * Memverifikasi token JWT dari header Authorization.
 * Ini adalah "Satpam" pertama yang mengecek "Apakah Anda punya tiket?"
 * Jika valid, ia menambahkan data 'user' ke 'req'.
 */
export const protect = (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    // 1. Cek header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]; // Ambil token-nya
    }

    if (!token) {
      throw new AppError('Tidak ada token, otorisasi ditolak', 401);
    }

    // 2. Verifikasi token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET tidak disetel di .env');
    }

    const decoded = jwt.verify(token, secret) as TokenPayload;

    // 3. Tambahkan data user ke object 'req'
    req.user = decoded.user;

    // 4. Lanjutkan ke "Satpam" berikutnya (jika ada) atau ke Controller
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Token tidak valid' });
    }
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).send('Server error');
  }
};

// ================================================
// --- FUNGSI BARU DIMULAI DI SINI ---
// ================================================
/**
 * Middleware "isAdmin" (Penjaga Ruang VIP)
 *
 * Middleware ini HARUS dijalankan SETELAH 'protect'.
 * Ini adalah "Satpam" kedua yang mengecek "Apakah tiket Anda VIP (admin)?"
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // 'protect' sudah mengisi 'req.user', jadi kita tinggal cek
  if (req.user && req.user.role === 'admin') {
    // Jika 'admin', biarkan dia lewat
    next();
  } else {
    // Jika 'user' biasa atau 'staff', tolak dia
    return res.status(403).json({
      message: 'Akses ditolak. Hanya admin yang diizinkan.',
    });
  }
};
