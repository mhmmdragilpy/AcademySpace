"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * ===================================================
 * FILE: server/src/routes/adminRoutes.ts (UPDATE)
 * LOKASI: server/src/routes/adminRoutes.ts
 * ===================================================
 */
const express_1 = require("express");
// Impor Manajer Admin (sekarang ada 2 fungsi)
const adminController_1 = require("../controllers/adminController");
// Impor KEDUA Satpam kita
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
/*
 * Definisikan rute untuk Admin
 * Semua rute di file ini akan diawali (di index.ts) dengan /api/admin
 */
// ===================================
// Rute Reservasi (Khusus Admin)
// ===================================
// GET /api/admin/reservations/all
// (Untuk melihat SEMUA reservasi)
router.get('/reservations/all', authMiddleware_1.protect, authMiddleware_1.isAdmin, adminController_1.getAllReservationsController);
// PUT /api/admin/reservations/status/:id
// (Untuk mengubah status [PENDING -> APPROVED/REJECTED])
router.put('/reservations/status/:id', // :id adalah ID reservasi
authMiddleware_1.protect, authMiddleware_1.isAdmin, adminController_1.updateReservationStatusController); // <-- RUTE BARU DITAMBAHKAN
exports.default = router;
