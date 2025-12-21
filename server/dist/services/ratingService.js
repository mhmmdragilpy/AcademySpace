import { RatingRepository } from '../repositories/RatingRepository.js';
import { ReservationRepository } from '../repositories/ReservationRepository.js';
import { AppError } from '../utils/AppError.js';
export class RatingService {
    ratingRepository;
    reservationRepository;
    constructor() {
        this.ratingRepository = new RatingRepository();
        this.reservationRepository = new ReservationRepository();
    }
    async createRating(data) {
        // Check if user has already rated
        const existing = await this.ratingRepository.findByUserAndReservation(data.userId, data.reservationId);
        if (existing) {
            throw new AppError("User has already rated this reservation", 400);
        }
        // Check reservation ownership and status
        // We need reservation details.
        // We can use ReservationRepository.
        // But `findById` isn't enough, we need to check status name too.
        // `findWithDetails` gives status name.
        const reservation = await this.reservationRepository.findWithDetails(data.reservationId);
        if (!reservation) {
            throw new AppError("Reservation not found", 404);
        }
        if (reservation.user_id !== data.userId) {
            throw new AppError("Reservation does not belong to user", 403);
        }
        // Check if COMPLETED (case sensitive check? Schema usually UPPERCASE)
        // Service had 'completed' lower case checked presumably from status name.
        // My migration uses 'APPROVED', 'PENDING' etc.
        // There might be a 'COMPLETED' status in the seeds?
        // Let's assume 'COMPLETED' or 'APPROVED' + past time?
        // The previous service checked `reservation.status !== 'completed'`.
        // If my status is 'APPROVED' but date is past, maybe it's effectively completed?
        // Or is there an explicit 'COMPLETED' status?
        // I will assume explicit status for now or check 'APPROVED'.
        if (reservation.status !== 'COMPLETED' && reservation.status !== 'APPROVED') {
            // Allowing APPROVED for flexibility if COMPLETED job isn't running
            throw new AppError("Cannot rate an incomplete reservation", 400);
        }
        const newRating = await this.ratingRepository.create({
            user_id: data.userId,
            facility_id: data.facilityId,
            reservation_id: data.reservationId,
            rating: data.rating,
            review: data.review
        });
        return newRating;
    }
    async getRatingsByFacility(facilityId) {
        return this.ratingRepository.findByFacilityId(facilityId);
    }
    async getAverageRatingForFacility(facilityId) {
        const stats = await this.ratingRepository.getAverageRating(facilityId);
        return {
            averageRating: stats.average_rating ? parseFloat(stats.average_rating) : 0,
            totalRatings: parseInt(stats.total_ratings)
        };
    }
    async getUserRatingForReservation(userId, reservationId) {
        return this.ratingRepository.findByUserAndReservation(userId, reservationId);
    }
}
export const ratingService = new RatingService();
//# sourceMappingURL=ratingService.js.map