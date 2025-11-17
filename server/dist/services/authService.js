"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const index_1 = require("../index");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../utils/AppError");
// --- LOGIKA REGISTRASI ---
const register = (email, password, fullName) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Cek apakah email sudah terdaftar
    const userExists = yield index_1.pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
        // Gunakan AppError untuk error yang kita prediksi
        throw new AppError_1.AppError('Email sudah terdaftar', 400);
    }
    // 2. Hash password
    const salt = yield bcrypt_1.default.genSalt(10);
    const password_hash = yield bcrypt_1.default.hash(password, salt);
    // 3. Simpan user baru ke database
    const newUser = yield index_1.pool.query('INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING user_id, email, full_name, role, created_at', [email, password_hash, fullName, 'user']);
    // Sembunyikan data sensitif sebelum dikembalikan
    delete newUser.rows[0].password_hash;
    return newUser.rows[0];
});
exports.register = register;
// --- LOGIKA LOGIN ---
const login = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Cek apakah user ada
    const userResult = yield index_1.pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
        throw new AppError_1.AppError('Kredensial tidak valid', 401);
    }
    const user = userResult.rows[0];
    // 2. Bandingkan password
    const isMatch = yield bcrypt_1.default.compare(password, user.password_hash);
    if (!isMatch) {
        throw new AppError_1.AppError('Kredensial tidak valid', 401);
    }
    // 3. Buat JSON Web Token (JWT)
    const payload = {
        user: {
            id: user.user_id,
            email: user.email,
            role: user.role,
        },
    };
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        // Ini adalah error sistem, bukan AppError
        throw new Error('JWT_SECRET tidak disetel di .env');
    }
    // 4. Buat token
    const token = jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '1d' });
    // 5. Siapkan data user untuk dikirim kembali
    const userResponse = {
        id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
    };
    return { token, user: userResponse };
});
exports.login = login;
/* Opsional: Buat file 'server/src/types/user.ts'
export interface User {
  user_id: number;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'admin' | 'staff' | 'user';
  created_at: string;
  last_login_at?: string;
}
*/ 
