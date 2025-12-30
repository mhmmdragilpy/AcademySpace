import { Router } from "express";
import {
    getAllFacilities,
    getFacilityById,
    getFacilityReservations,
    createFacility,
    updateFacility,
    deleteFacility,
    setMaintenance,
    clearMaintenance
} from "../controllers/facilityController.js";
import { authenticateToken, authorizeAdmin } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
    createFacilitySchema,
    updateFacilitySchema,
    facilityIdSchema,
    getFacilitiesQuerySchema
} from "../schemas/facility.schema.js";

const router = Router();

// [USE CASE #4] [USE CASE #18] Mencari Fasilitas - Public Routes
router.get("/", validate(getFacilitiesQuerySchema), getAllFacilities);
// [USE CASE #5] Melihat Detail Ruangan
router.get("/:id", validate(facilityIdSchema), getFacilityById);
// [USE CASE #6] Ketersediaan Fasilitas
router.get("/:id/reservations", validate(facilityIdSchema), getFacilityReservations);

// [USE CASE #13] Mengelola Fasilitas - Admin Routes
router.post("/", authenticateToken, authorizeAdmin, validate(createFacilitySchema), createFacility);
router.put("/:id", authenticateToken, authorizeAdmin, validate(updateFacilitySchema), updateFacility);
router.delete("/:id", authenticateToken, authorizeAdmin, validate(facilityIdSchema), deleteFacility);

// Maintenance routes
router.put("/:id/maintenance", authenticateToken, authorizeAdmin, validate(facilityIdSchema), setMaintenance);
router.delete("/:id/maintenance", authenticateToken, authorizeAdmin, validate(facilityIdSchema), clearMaintenance);

export default router;
