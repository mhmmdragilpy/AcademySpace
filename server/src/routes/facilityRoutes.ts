import { Router } from "express";
import {
    getAllFacilities,
    getFacilityById,
    getFacilityReservations,
    createFacility,
    updateFacility,
    deleteFacility
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

router.get("/", validate(getFacilitiesQuerySchema), getAllFacilities);
router.get("/:id", validate(facilityIdSchema), getFacilityById);
router.get("/:id/reservations", validate(facilityIdSchema), getFacilityReservations);

router.post("/", authenticateToken, authorizeAdmin, validate(createFacilitySchema), createFacility);
router.put("/:id", authenticateToken, authorizeAdmin, validate(updateFacilitySchema), updateFacility);
router.delete("/:id", authenticateToken, authorizeAdmin, validate(facilityIdSchema), deleteFacility);

export default router;
