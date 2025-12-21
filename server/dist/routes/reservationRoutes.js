import { Router } from "express";
import { createReservation, getUserReservations, getAllReservations, updateReservationStatus, updateReservation, cancelReservation, getReservationById, getReservationStats, getFacilityUtilization, getUserActivity } from "../controllers/reservationController.js";
import { authenticateToken, authorizeAdmin } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { reservationSchema, reservationStatusSchema, reservationIdSchema, updateReservationSchema } from "../schemas/reservation.schema.js";
const router = Router();
router.post("/", authenticateToken, validate(reservationSchema), createReservation);
router.get("/my", authenticateToken, getUserReservations);
router.get("/", authenticateToken, authorizeAdmin, getAllReservations);
// Specific order matters: stats, utilization, user-activity are not :id
// Specific order matters: stats, utilization, user-activity are not :id
router.get("/stats", authenticateToken, authorizeAdmin, getReservationStats);
router.get("/utilization", authenticateToken, authorizeAdmin, getFacilityUtilization);
router.get("/user-activity", authenticateToken, authorizeAdmin, getUserActivity);
router.get("/:id", authenticateToken, getReservationById);
router.put("/:id", authenticateToken, validate(updateReservationSchema), updateReservation);
router.put("/:id/status", authenticateToken, authorizeAdmin, validate(reservationStatusSchema), updateReservationStatus);
router.delete("/:id", authenticateToken, validate(reservationIdSchema), cancelReservation);
export default router;
//# sourceMappingURL=reservationRoutes.js.map