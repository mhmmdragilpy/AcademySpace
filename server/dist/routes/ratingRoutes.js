import { Router } from "express";
import { createRating, getRatingsByFacility, getAverageRatingForFacility, getUserRatingForReservation } from "../controllers/ratingController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { createRatingSchema, facilityIdSchema, ratingReservationIdSchema } from "../schemas/rating.schema.js";
const router = Router();
// Create a rating for a completed reservation
router.post("/", authenticateToken, validate(createRatingSchema), createRating);
// Get ratings for a specific facility
router.get("/facility/:facilityId", validate(facilityIdSchema), getRatingsByFacility);
// Get average rating for a facility
router.get("/facility/:facilityId/average", validate(facilityIdSchema), getAverageRatingForFacility);
// Get user's rating for a specific reservation
router.get("/reservation/:reservationId", authenticateToken, validate(ratingReservationIdSchema), getUserRatingForReservation);
export default router;
//# sourceMappingURL=ratingRoutes.js.map