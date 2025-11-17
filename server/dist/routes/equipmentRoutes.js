"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * =======================================================
 * FILE: server/src/routes/equipmentRoutes.ts (FILE BARU)
 * LOKASI: server/src/routes/equipmentRoutes.ts
 * =======================================================
 */
const express_1 = require("express");
// Impor SEMUA controller peralatan
const equipmentController_1 = require("../controllers/equipmentController");
// Impor KEDUA Satpam kita
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
/*
 * Definisikan rute untuk Peralatan
 * Semua rute di file ini akan diawali (di index.ts) dengan /api/equipment
 */
// ===================================
// Rute GET (Read) - Dibutuhkan oleh user biasa untuk reservasi
// ===================================
// GET /api/equipment
router.get('/', authMiddleware_1.protect, equipmentController_1.getAllEquipmentController);
// GET /api/equipment/:id
router.get('/:id', authMiddleware_1.protect, equipmentController_1.getEquipmentByIdController);
// ===================================
// Rute CRUD Admin (Create, Update, Delete)
// ===================================
// POST /api/equipment (Admin)
router.post('/', authMiddleware_1.protect, authMiddleware_1.isAdmin, equipmentController_1.createEquipmentController);
// PUT /api/equipment/:id (Admin)
router.put('/:id', authMiddleware_1.protect, authMiddleware_1.isAdmin, equipmentController_1.updateEquipmentController);
// DELETE /api/equipment/:id (Admin)
router.delete('/:id', authMiddleware_1.protect, authMiddleware_1.isAdmin, equipmentController_1.deleteEquipmentController);
exports.default = router;
