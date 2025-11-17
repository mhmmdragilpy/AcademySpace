/*
 * ===============================================
 * FILE: server/src/routes/reservationRoutes.ts (UPDATE: AVAILABILITY)
 * ===============================================
 */
import { Router } from 'express';
// Impor SEMUA controller (termasuk controller baru)
import {
  createReservationController,
  getMyReservationsController,
  cancelReservationController,
  getAvailabilityController, // <-- Impor controller baru
} from '../controllers/reservationController';
import { protect } from '../middleware/authMiddleware'; // Impor "Satpam" API kita

const router = Router();

/**
 * Definisikan rute untuk Reservasi
 */

// POST /api/reservations (Untuk Membuat Reservasi Baru)
router.post('/', protect, createReservationController);

// GET /api/reservations/my-history (Untuk Melihat Riwayat Saya)
router.get('/my-history', protect, getMyReservationsController);

// PUT /api/reservations/cancel/:id (Untuk Pembatalan oleh User)
router.put('/cancel/:id', protect, cancelReservationController);

// GET /api/reservations/availability/:facilityId
// Untuk mengecek slot waktu yang sudah dibooking pada tanggal tertentu.
// Alur: Request -> 'protect' (Cek Login) -> 'getAvailabilityController'
router.get('/availability/:facilityId', protect, getAvailabilityController); // <-- RUTE BARU DITAMBAHKAN

export default router;
