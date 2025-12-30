import { Router } from "express";
import { createReservation, getUserReservations, getAllReservations, updateReservationStatus, updateReservation, cancelReservation, getReservationById, getReservationStats, getFacilityUtilization, getUserActivity } from "../controllers/reservationController.js";
import { authenticateToken, authorizeAdmin } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { reservationSchema, reservationStatusSchema, reservationIdSchema, updateReservationSchema } from "../schemas/reservation.schema.js";
const router = Router();
// [USE CASE #7] Mengajukan Reservasi - Submit Form
router.post("/", authenticateToken, validate(reservationSchema), createReservation);
// [USE CASE #12] Melihat Riwayat Reservasi - List My Reservations
router.get("/my", authenticateToken, getUserReservations);
// [USE CASE #14] Melihat Jadwal Reservasi - Admin List All
router.get("/", authenticateToken, authorizeAdmin, getAllReservations);
// Specific order matters: stats, utilization, user-activity are not :id
// Specific order matters: stats, utilization, user-activity are not :id
// [USE CASE #15] Melihat Analitik dan Pelaporan - Stats Endpoints
router.get("/stats", authenticateToken, authorizeAdmin, getReservationStats);
router.get("/utilization", authenticateToken, authorizeAdmin, getFacilityUtilization);
router.get("/user-activity", authenticateToken, authorizeAdmin, getUserActivity);
// [USE CASE #10] Melihat Detail Reservasi
router.get("/:id", authenticateToken, getReservationById);
// [USE CASE #8] Mengedit atau Membatalkan Reservasi - User Actions
router.put("/:id", authenticateToken, validate(updateReservationSchema), updateReservation);
// [USE CASE #9] Menyetujui atau Menolak Reservasi - Admin Approval
router.put("/:id/status", authenticateToken, authorizeAdmin, validate(reservationStatusSchema), updateReservationStatus);
// [USE CASE #8] Mengedit atau Membatalkan Reservasi - Delete/Cancel
router.delete("/:id", authenticateToken, validate(reservationIdSchema), cancelReservation);
export default router;
//# sourceMappingURL=reservationRoutes.js.map