"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../utils/AppError");
/**
 * Middleware "protect" (Penjaga Gerbang)
 *
 * Memverifikasi token JWT dari header Authorization.
 * Ini adalah "Satpam" pertama yang mengecek "Apakah Anda punya tiket?"
 * Jika valid, ia menambahkan data 'user' ke 'req'.
 */
const protect = (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization;
        // 1. Cek header
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1]; // Ambil token-nya
        }
        if (!token) {
            throw new AppError_1.AppError('Tidak ada token, otorisasi ditolak', 401);
        }
        // 2. Verifikasi token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET tidak disetel di .env');
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // 3. Tambahkan data user ke object 'req'
        req.user = decoded.user;
        // 4. Lanjutkan ke "Satpam" berikutnya (jika ada) atau ke Controller
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ message: 'Token tidak valid' });
        }
        if (err instanceof AppError_1.AppError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        return res.status(500).send('Server error');
    }
};
exports.protect = protect;
// ================================================
// --- FUNGSI BARU DIMULAI DI SINI ---
// ================================================
/**
 * Middleware "isAdmin" (Penjaga Ruang VIP)
 *
 * Middleware ini HARUS dijalankan SETELAH 'protect'.
 * Ini adalah "Satpam" kedua yang mengecek "Apakah tiket Anda VIP (admin)?"
 */
const isAdmin = (req, res, next) => {
    // 'protect' sudah mengisi 'req.user', jadi kita tinggal cek
    if (req.user && req.user.role === 'admin') {
        // Jika 'admin', biarkan dia lewat
        next();
    }
    else {
        // Jika 'user' biasa atau 'staff', tolak dia
        return res.status(403).json({
            message: 'Akses ditolak. Hanya admin yang diizinkan.'
        });
    }
};
exports.isAdmin = isAdmin;
