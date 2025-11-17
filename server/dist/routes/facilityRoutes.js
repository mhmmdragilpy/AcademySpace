"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * ============================================
 * FILE: server/src/routes/facilityRoutes.ts (UPDATE: CRUD Admin)
 * ============================================
 */
const express_1 = require("express");
// Impor SEMUA controller fasilitas (termasuk fungsi PUT/DELETE yang baru)
const facilityController_1 = require("../controllers/facilityController");
// Impor KEDUA Satpam kita
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
/*
 * Definisikan rute untuk Fasilitas
 */
// GET /api/facilities/types (USER/ADMIN): Mengambil daftar tipe fasilitas
router.get('/types', authMiddleware_1.protect, facilityController_1.getAllFacilityTypesController);
// GET /api/facilities (USER): Mengambil semua fasilitas
router.get('/', authMiddleware_1.protect, facilityController_1.getAllFacilities);
// GET /api/facilities/:id (USER): Mengambil detail satu fasilitas
router.get('/:id', authMiddleware_1.protect, facilityController_1.getFacilityById);
// POST /api/facilities (ADMIN): Membuat fasilitas baru
router.post('/', authMiddleware_1.protect, authMiddleware_1.isAdmin, facilityController_1.createFacilityController);
// ===================================
// Rute CRUD Admin (Khusus Admin)
// ===================================
// PUT /api/facilities/:id (ADMIN): Mengupdate fasilitas
router.put('/:id', authMiddleware_1.protect, authMiddleware_1.isAdmin, facilityController_1.updateFacilityController); // <-- RUTE BARU DITAMBAHKAN
// DELETE /api/facilities/:id (ADMIN): Menghapus fasilitas
router.delete('/:id', authMiddleware_1.protect, authMiddleware_1.isAdmin, facilityController_1.deleteFacilityController); // <-- RUTE BARU DITAMBAHKAN
exports.default = router;
