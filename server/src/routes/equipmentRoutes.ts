/*
 * =======================================================
 * FILE: server/src/routes/equipmentRoutes.ts (FILE BARU)
 * LOKASI: server/src/routes/equipmentRoutes.ts
 * =======================================================
 */
import { Router } from 'express';
// Impor SEMUA controller peralatan
import {
  getAllEquipmentController,
  getEquipmentByIdController,
  createEquipmentController,
  updateEquipmentController,
  deleteEquipmentController,
} from '../controllers/equipmentController';
// Impor KEDUA Satpam kita
import { protect, isAdmin } from '../middleware/authMiddleware';

const router = Router();

/*
 * Definisikan rute untuk Peralatan
 * Semua rute di file ini akan diawali (di index.ts) dengan /api/equipment
 */

// ===================================
// Rute GET (Read) - Dibutuhkan oleh user biasa untuk reservasi
// ===================================

// GET /api/equipment
router.get('/', protect, getAllEquipmentController);

// GET /api/equipment/:id
router.get('/:id', protect, getEquipmentByIdController);

// ===================================
// Rute CRUD Admin (Create, Update, Delete)
// ===================================

// POST /api/equipment (Admin)
router.post('/', protect, isAdmin, createEquipmentController);

// PUT /api/equipment/:id (Admin)
router.put('/:id', protect, isAdmin, updateEquipmentController);

// DELETE /api/equipment/:id (Admin)
router.delete('/:id', protect, isAdmin, deleteEquipmentController);

export default router;
