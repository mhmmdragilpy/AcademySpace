import { ratingService } from "../services/ratingService.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendSuccess, sendCreated } from "../utils/response.js";
export const createRating = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const body = req.body;
    const newRating = await ratingService.createRating({
        ...body,
        userId
    });
    sendCreated(res, newRating);
});
export const getRatingsByFacility = catchAsync(async (req, res) => {
    const facilityId = parseInt(req.params.facilityId || "0");
    const ratings = await ratingService.getRatingsByFacility(facilityId);
    sendSuccess(res, ratings);
});
export const getAverageRatingForFacility = catchAsync(async (req, res) => {
    const facilityId = parseInt(req.params.facilityId || "0");
    const averageRating = await ratingService.getAverageRatingForFacility(facilityId);
    sendSuccess(res, averageRating);
});
export const getUserRatingForReservation = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const reservationId = parseInt(req.params.reservationId || "0");
    const rating = await ratingService.getUserRatingForReservation(userId, reservationId);
    sendSuccess(res, rating);
});
//# sourceMappingURL=ratingController.js.map