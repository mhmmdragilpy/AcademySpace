import { Request, Response } from 'express';
// Impor 'otak' kita
import * as authService from '../services/authService';
// Impor error kustom kita
import { AppError } from '../utils/AppError';

/**
 * @route   POST /api/auth/register
 * @desc    Mendaftarkan user baru
 * @access  Public
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    // 1. Validasi input dasar
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }

    // 2. Panggil 'otak' (Service) untuk melakukan pekerjaan berat
    const newUser = await authService.register(email, password, full_name);

    // 3. Kirim respon sukses
    return res.status(201).json({
      message: 'User berhasil dibuat',
      user: newUser,
    });
  } catch (err) {
    // 4. Tangani error
    if (err instanceof AppError) {
      // Jika ini error yang kita prediksi (mis: 'Email sudah terdaftar')
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Jika ini error tak terduga (bug)
    console.error(err);
    return res.status(500).send('Server error');
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user dan dapatkan token
 * @access  Public
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    // 1. Validasi input dasar
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password harus diisi' });
    }

    // 2. Panggil 'otak' (Service) untuk login
    const data = await authService.login(email, password);

    // 3. Kirim respon sukses
    return res.json({
      message: 'Login berhasil',
      ...data, // Berisi { token, user }
    });
  } catch (err) {
    // 4. Tangani error
    if (err instanceof AppError) {
      // Jika ini error yang kita prediksi (mis: 'Kredensial tidak valid')
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Jika ini error tak terduga (bug)
    console.error(err);
    return res.status(500).send('Server error');
  }
};
