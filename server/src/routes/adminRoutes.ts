/*
 * ===================================================
 * FILE: server/src/routes/adminRoutes.ts (UPDATE)
 * LOKASI: server/src/routes/adminRoutes.ts
 * ===================================================
 */
import { Router } from 'express';

// Impor Manajer Admin (sekarang ada 2 fungsi)
import {
  getAllReservationsController,
  updateReservationStatusController, // <-- Impor fungsi baru
} from '../controllers/adminController';

// Impor KEDUA Satpam kita
import { protect, isAdmin } from '../middleware/authMiddleware';

const router = Router();

/*
 * Definisikan rute untuk Admin
 * Semua rute di file ini akan diawali (di index.ts) dengan /api/admin
 */

// ===================================
// Rute Reservasi (Khusus Admin)
// ===================================

// GET /api/admin/reservations/all
// (Untuk melihat SEMUA reservasi)
router.get('/reservations/all', protect, isAdmin, getAllReservationsController);

// PUT /api/admin/reservations/status/:id
// (Untuk mengubah status [PENDING -> APPROVED/REJECTED])
router.put(
  '/reservations/status/:id', // :id adalah ID reservasi
  protect,
  isAdmin,
  updateReservationStatusController
); // <-- RUTE BARU DITAMBAHKAN

export default router;
