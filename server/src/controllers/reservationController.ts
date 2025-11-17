/*
 * =======================================================
 * FILE: server/src/controllers/reservationController.ts (UPDATE: AVAILABILITY)
 * =======================================================
 */
import { Request, Response } from 'express';
// Impor 'otak' kita
import * as reservationService from '../services/reservationService';
// Impor error kustom kita
import { AppError } from '../utils/AppError';

// --- FUNGSI CREATE RESERVATION (Tidak Berubah) ---
export const createReservationController = async (req: Request, res: Response) => {
  try {
    const { purpose, attendees, items } = req.body;
    const requester_id = req.user?.id;

    if (!requester_id) {
      return res.status(401).json({ message: 'User tidak terotentikasi' });
    }
    if (!purpose || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Input tidak valid. Membutuhkan "purpose" (string) dan "items" (array)',
      });
    }

    const newReservation = await reservationService.createReservation({
      requester_id,
      purpose,
      attendees,
      items,
    });

    return res.status(201).json({
      message: 'Reservasi berhasil dibuat dan sedang menunggu approval',
      reservation: newReservation,
    });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    if (err instanceof Error) {
      console.error(err.message);
      return res.status(500).send('Server error saat membuat reservasi');
    }
    console.error(err);
    return res.status(500).send('Server error (unknown) saat membuat reservasi');
  }
};

// --- FUNGSI GET RIWAYAT RESERVASI (Tidak Berubah) ---
export const getMyReservationsController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User tidak terotentikasi' });
    }

    const reservations = await reservationService.getMyReservations(userId);

    return res.status(200).json(reservations);
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    if (err instanceof Error) {
      console.error(err.message);
      return res.status(500).send('Server error saat mengambil riwayat reservasi');
    }

    console.error(err);
    return res.status(500).send('Server error (unknown) saat mengambil riwayat');
  }
};

// --- FUNGSI CANCEL RESERVASI (Tidak Berubah) ---
export const cancelReservationController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID Reservasi
    const userId = req.user?.id; // ID User yang mencoba membatalkan

    const reservationId = parseInt(id, 10);

    if (!userId || isNaN(reservationId)) {
      return res.status(400).json({ message: 'Data atau ID reservasi tidak valid.' });
    }

    const result = await reservationService.cancelReservation(reservationId, userId);

    return res.status(200).json({
      message: result.message,
      status: result.status,
    });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    if (err instanceof Error) {
      console.error(err.message);
      return res.status(500).send('Server error saat membatalkan reservasi');
    }

    console.error(err);
    return res.status(500).send('Server error (unknown) saat membatalkan reservasi');
  }
};

// ================================================
// --- FUNGSI BARU DIMULAI DI SINI ---
// ================================================
/**
 * @route   GET /api/reservations/availability/:facilityId?date=...
 * @desc    Mengecek slot waktu yang sudah dibooking
 * @access  Private (membutuhkan login)
 */
export const getAvailabilityController = async (req: Request, res: Response) => {
  try {
    const { facilityId } = req.params;
    // Ambil tanggal dari query string (e.g., ?date=2025-11-20)
    const date = req.query.date as string;

    const facilityIdNum = parseInt(facilityId, 10);

    if (isNaN(facilityIdNum) || !date) {
      return res.status(400).json({
        message: 'ID fasilitas atau tanggal (query parameter: ?date=YYYY-MM-DD) tidak valid.',
      });
    }

    // Panggil "Otak" (Service)
    const busySlots = await reservationService.checkAvailability(facilityIdNum, date);

    // Kirim array slot yang sibuk
    return res.status(200).json(busySlots);
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    if (err instanceof Error) {
      console.error(err.message);
      return res.status(500).send('Server error saat mengecek ketersediaan');
    }
    console.error(err);
    return res.status(500).send('Server error (unknown) saat mengecek ketersediaan');
  }
};
