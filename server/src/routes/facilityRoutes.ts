/*
 * ============================================
 * FILE: server/src/routes/facilityRoutes.ts (UPDATE: CRUD Tipe)
 * ============================================
 */
import { Router } from 'express';
// Impor SEMUA controller fasilitas (termasuk 3 fungsi CRUD Tipe yang baru)
import {
  getAllFacilities,
  getFacilityById,
  createFacilityController,
  getAllFacilityTypesController,
  updateFacilityController,
  deleteFacilityController,
  createFacilityTypeController, // <-- Impor fungsi baru
  updateFacilityTypeController, // <-- Impor fungsi baru
  deleteFacilityTypeController, // <-- Impor fungsi baru
} from '../controllers/facilityController';
// Impor KEDUA Satpam kita
import { protect, isAdmin } from '../middleware/authMiddleware';

const router = Router();

/*
 * Definisikan rute untuk Fasilitas
 */

// ===================================
// RUTE TIPE FASILITAS (Master Data)
// ===================================

// GET /api/facilities/types (USER/ADMIN): Mengambil daftar tipe fasilitas
router.get('/types', protect, getAllFacilityTypesController);

// POST /api/facilities/types (ADMIN): Membuat tipe fasilitas baru
router.post('/types', protect, isAdmin, createFacilityTypeController); // <-- RUTE BARU

// PUT /api/facilities/types/:id (ADMIN): Mengupdate tipe fasilitas
router.put('/types/:id', protect, isAdmin, updateFacilityTypeController); // <-- RUTE BARU

// DELETE /api/facilities/types/:id (ADMIN): Menghapus tipe fasilitas
router.delete('/types/:id', protect, isAdmin, deleteFacilityTypeController); // <-- RUTE BARU

// ===================================
// RUTE CRUD FASILITAS UTAMA
// ===================================

// GET /api/facilities (USER): Mengambil semua fasilitas
router.get('/', protect, getAllFacilities);

// GET /api/facilities/:id (USER): Mengambil detail satu fasilitas
router.get('/:id', protect, getFacilityById);

// POST /api/facilities (ADMIN): Membuat fasilitas baru
router.post('/', protect, isAdmin, createFacilityController);

// PUT /api/facilities/:id (ADMIN): Mengupdate fasilitas
router.put('/:id', protect, isAdmin, updateFacilityController);

// DELETE /api/facilities/:id (ADMIN): Menghapus fasilitas
router.delete('/:id', protect, isAdmin, deleteFacilityController);

export default router;
