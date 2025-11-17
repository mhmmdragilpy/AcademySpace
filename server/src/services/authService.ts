import { pool } from '../index';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { User } from '../types/user'; // (Kita akan buat tipe ini)

// --- LOGIKA REGISTRASI ---
export const register = async (
  email: string,
  password: string,
  fullName: string
): Promise<User> => {
  // 1. Cek apakah email sudah terdaftar
  const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (userExists.rows.length > 0) {
    // Gunakan AppError untuk error yang kita prediksi
    throw new AppError('Email sudah terdaftar', 400);
  }

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // 3. Simpan user baru ke database
  const newUser = await pool.query(
    'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING user_id, email, full_name, role, created_at',
    [email, password_hash, fullName, 'user']
  );

  // Sembunyikan data sensitif sebelum dikembalikan
  delete newUser.rows[0].password_hash;
  return newUser.rows[0];
};

// --- LOGIKA LOGIN ---
export const login = async (email: string, password: string) => {
  // 1. Cek apakah user ada
  const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (userResult.rows.length === 0) {
    throw new AppError('Kredensial tidak valid', 401);
  }

  const user: User = userResult.rows[0];

  // 2. Bandingkan password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new AppError('Kredensial tidak valid', 401);
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
  const token = jwt.sign(payload, secret, { expiresIn: '1d' });

  // 5. Siapkan data user untuk dikirim kembali
  const userResponse = {
    id: user.user_id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  };

  return { token, user: userResponse };
};

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
