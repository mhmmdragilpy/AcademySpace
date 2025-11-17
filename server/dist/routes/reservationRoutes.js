"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * ===============================================
 * FILE: server/src/routes/reservationRoutes.ts (UPDATE: AVAILABILITY)
 * ===============================================
 */
const express_1 = require("express");
// Impor SEMUA controller (termasuk controller baru)
const reservationController_1 = require("../controllers/reservationController");
const authMiddleware_1 = require("../middleware/authMiddleware"); // Impor "Satpam" API kita
const router = (0, express_1.Router)();
/**
 * Definisikan rute untuk Reservasi
 */
// POST /api/reservations (Untuk Membuat Reservasi Baru)
router.post('/', authMiddleware_1.protect, reservationController_1.createReservationController);
// GET /api/reservations/my-history (Untuk Melihat Riwayat Saya)
router.get('/my-history', authMiddleware_1.protect, reservationController_1.getMyReservationsController);
// PUT /api/reservations/cancel/:id (Untuk Pembatalan oleh User)
router.put('/cancel/:id', authMiddleware_1.protect, reservationController_1.cancelReservationController);
// GET /api/reservations/availability/:facilityId
// Untuk mengecek slot waktu yang sudah dibooking pada tanggal tertentu.
// Alur: Request -> 'protect' (Cek Login) -> 'getAvailabilityController'
router.get('/availability/:facilityId', authMiddleware_1.protect, reservationController_1.getAvailabilityController); // <-- RUTE BARU DITAMBAHKAN
exports.default = router;
