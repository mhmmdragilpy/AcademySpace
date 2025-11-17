/*
 * =======================================================
 * FILE: server/src/controllers/adminController.ts (UPDATE)
 * LOKASI: server/src/controllers/adminController.ts
 * =======================================================
 */
import { Request, Response } from 'express';
// Impor "Otak" Admin
import * as adminService from '../services/adminService';
// Impor error kustom kita
import { AppError } from '../utils/AppError';

/**
 * @route   GET /api/admin/reservations/all
 * @desc    (Admin) Mengambil SEMUA reservasi dari semua user
 * @access  Admin
 */
export const getAllReservationsController = async (req: Request, res: Response) => {
  try {
    // 1. Panggil "Otak" (Service) untuk mengambil data
    const allReservations = await adminService.getAllReservations();

    // 2. Kirim data
    return res.status(200).json(allReservations);
  } catch (err: unknown) {
    // <-- Penanganan error yang aman

    // 3. Tangani error yang dilempar oleh Service
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    if (err instanceof Error) {
      console.error(err.message);
      return res.status(500).send('Server error saat mengambil semua reservasi');
    }

    console.error(err);
    return res.status(500).send('Server error (unknown) saat mengambil data');
  }
};

// ================================================
// --- FUNGSI BARU DIMULAI DI SINI ---
// ================================================
/**
 * @route   PUT /api/admin/reservations/status/:id
 * @desc    (Admin) Mengubah status reservasi (Approve/Reject)
 * @access  Admin
 */
export const updateReservationStatusController = async (req: Request, res: Response) => {
  try {
    // 1. Validasi Input
    const { id } = req.params; // ID Reservasi
    const { status, comment } = req.body; // Status baru ('APPROVED' / 'REJECTED')

    const adminId = req.user?.id; // ID Admin (dari 'protect' middleware)
    if (!adminId) {
      return res.status(401).json({ message: 'User admin tidak terotentikasi' });
    }

    const reservationId = parseInt(id, 10);
    if (isNaN(reservationId)) {
      return res.status(400).json({ message: 'ID reservasi tidak valid' });
    }

    if (!status || (status !== 'APPROVED' && status !== 'REJECTED' && status !== 'CANCELED')) {
      return res.status(400).json({
        message: "Status tidak valid. Harus 'APPROVED', 'REJECTED', atau 'CANCELED'.",
      });
    }

    // 2. Panggil "Otak" (Service) untuk melakukan pekerjaan berat
    const result = await adminService.updateReservationStatus(
      reservationId,
      status,
      adminId,
      comment || null // Kirim null jika comment kosong
    );

    // 3. Kirim respon sukses
    return res.status(200).json(result);
  } catch (err: unknown) {
    // <-- Penanganan error yang aman

    // 4. Tangani error (mis: 404 Reservasi tidak ditemukan)
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    if (err instanceof Error) {
      console.error(err.message);
      return res.status(500).send('Server error saat update status');
    }

    console.error(err);
    return res.status(500).send('Server error (unknown) saat update status');
  }
};
