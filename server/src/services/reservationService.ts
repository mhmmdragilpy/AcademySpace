import { ReservationRepository } from '../repositories/ReservationRepository.js';
import { FacilityRepository } from '../repositories/FacilityRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { NotificationRepository } from '../repositories/NotificationRepository.js';
import { query } from '../db/index.js'; // For raw queries if needed, but try to avoid
import logger from '../utils/logger.js';
import { AppError } from '../utils/AppError.js';

// Status Repository (Inline for now or generic)
// We need status IDs often.
const getStatusId = async (name: string): Promise<number | null> => {
    // Ideally cache this or use a repo
    const res = await query("SELECT status_id FROM reservation_statuses WHERE name = $1", [name.toUpperCase()]);
    return res.rows[0]?.status_id || null;
}

export class ReservationService {
    private reservationRepository: ReservationRepository;
    private facilityRepository: FacilityRepository;
    private userRepository: UserRepository;
    private notificationRepository: NotificationRepository;

    constructor() {
        this.reservationRepository = new ReservationRepository();
        this.facilityRepository = new FacilityRepository();
        this.userRepository = new UserRepository();
        this.notificationRepository = new NotificationRepository();
    }

    async create(data: {
        userId: number;
        facilityId?: number;
        date: string;
        startTime: string;
        endTime: string;
        purpose: string;
        participants: number;
        proposal_url?: string;
    }) {
        const user = await this.userRepository.findById(data.userId);
        if (!user) throw new AppError("User not found", 404);

        if (!data.facilityId) {
            throw new AppError("Must specify facilityId", 400);
        }

        let facility = null;

        if (data.facilityId) {
            facility = await this.facilityRepository.findById(data.facilityId);
            if (!facility) throw new AppError("Facility not found", 404);

            // Validation: Capacity Check
            const safeCapacity = facility.capacity || 0;
            if (data.participants > safeCapacity) {
                throw new AppError(`Kapasitas tidak mencukupi, sisa hanya ${safeCapacity}`, 400);
            }

            // Validation: Maintenance Check
            if (facility.maintenance_until && new Date(facility.maintenance_until) > new Date()) {
                throw new AppError(`Fasilitas sedang dalam perbaikan sampai ${new Date(facility.maintenance_until).toLocaleDateString()}. Alasan: ${facility.maintenance_reason || 'Maintenance'}`, 400);
            }
        }

        const startDateTime = `${data.date} ${data.startTime}:00`;
        const endDateTime = `${data.date} ${data.endTime}:00`;

        if (data.facilityId) {
            const conflicts = await this.reservationRepository.findConflicts(data.facilityId, startDateTime, endDateTime);
            if (conflicts.length > 0) {
                throw new AppError("Time slot not available. Conflict with an existing reservation.", 409);
            }
        }

        const pendingStatusId = await getStatusId('PENDING');
        if (!pendingStatusId) throw new AppError("System configuration error: Status PENDING not found", 500);

        const reservation = await this.reservationRepository.createWithItem({
            userId: data.userId,
            statusId: pendingStatusId,
            purpose: data.purpose,
            attendees: data.participants,
            facilityId: data.facilityId,
            startDateTime,
            endDateTime,
            proposalUrl: data.proposal_url
        });

        // Notifications
        await this.notificationRepository.createNotification(
            data.userId,
            `New reservation for ${data.date} at ${data.startTime}-${data.endTime} is pending approval`
        );

        // Return enriched result
        return {
            id: reservation.reservation_id,
            ...data,
            status: 'PENDING'
        };
    }

    async getUserReservations(userId: number) {
        const rows = await this.reservationRepository.findByUserId(userId);
        return rows.map((r: any) => ({
            id: r.reservation_id,
            facilityName: r.facility_name,
            facilityType: 'facility',
            date: r.date,
            startTime: r.start_time,
            endTime: r.end_time,
            status: r.status,
            purpose: r.purpose,
            facilityId: r.facility_id,
            isRated: r.is_rated
        }));
    }

    async getAllReservations() {
        const rows = await this.reservationRepository.findAllWithDetails();
        return rows.map((r: any) => ({
            id: r.reservation_id,
            userName: r.user_name,
            userUsername: r.user_username,
            facilityName: r.facility_name,
            date: r.date,
            startTime: r.start_time,
            endTime: r.end_time,
            status: r.status,
            purpose: r.purpose,
            participants: r.attendees || 0,
            proposalUrl: r.proposal_url || null
        }));
    }

    async getById(id: number, requesterId?: number) {
        const detail = await this.reservationRepository.findWithDetails(id);
        if (!detail) return null;

        // Authorization check if requester provided
        if (requesterId && detail.user_id !== requesterId) {
            // In future allow admin to bypass, but caller should handle admin check.
            // If this method is "getById", it just gets.
            // "getByIdForUser" might check.
        }

        return {
            id: detail.reservation_id,
            userName: detail.user_name,
            userUsername: detail.user_username,
            facilityName: detail.facility_name,
            status: detail.status,
            purpose: detail.purpose,
            userId: detail.user_id,
            date: detail.date,
            startTime: detail.start_time,
            endTime: detail.end_time,
            participants: detail.attendees,
            facilityCapacity: detail.facility_capacity
        };
    }

    async update(id: number, userId: number, data: {
        date?: string;
        startTime?: string;
        endTime?: string;
        purpose?: string;
        participants?: number;
    }) {
        const existing = await this.reservationRepository.findWithDetails(id);
        if (!existing) throw new AppError("Reservation not found", 404);

        if (existing.user_id !== userId) throw new AppError("Not authorized to edit this reservation", 403);

        if (String(existing.status).toUpperCase() !== 'PENDING') {
            throw new AppError("Only PENDING reservations can be edited", 400);
        }

        let startDateTime = undefined;
        let endDateTime = undefined;

        // Simplify Date/Time Logic
        const newDate = data.date || existing.date;
        const newStart = data.startTime || existing.start_time;
        const newEnd = data.endTime || existing.end_time;
        const newParticipants = data.participants || existing.attendees;

        // Check if time is changing
        const timeChanged = data.date || data.startTime || data.endTime;

        if (timeChanged) {
            startDateTime = `${newDate} ${newStart}:00`;
            endDateTime = `${newDate} ${newEnd}:00`;

            const facilityId = existing.facility_id;
            if (facilityId) {
                // Check Conflicts
                const conflicts = await this.reservationRepository.findConflicts(
                    facilityId,
                    startDateTime,
                    endDateTime,
                    id // Exclude self
                );

                if (conflicts.length > 0) {
                    throw new AppError("Time slot not available. Conflict with an existing reservation.", 409);
                }
            }
        }

        // Check Capacity (if participants or facility/time changed - though here facility doesn't change)
        if (data.participants || timeChanged) {
            const facilityId = existing.facility_id;
            if (facilityId) {
                const facility = await this.facilityRepository.findById(facilityId);
                if (facility && newParticipants > (facility.capacity || 0)) {
                    throw new AppError(`Kapasitas tidak mencukupi, sisa hanya ${facility.capacity}`, 400);
                }
            }
        }

        return this.reservationRepository.updateWithDetails(id, {
            purpose: data.purpose,
            attendees: data.participants,
            startDateTime,
            endDateTime
        });
    }

    async updateStatus(id: number, status: string) {
        const statusId = await getStatusId(status);
        if (!statusId) throw new AppError("Invalid status", 400);

        const detail = await this.reservationRepository.findWithDetails(id);
        if (!detail) throw new AppError("Reservation not found", 404);

        const updated = await this.reservationRepository.update(id, { status_id: statusId });

        // Notification & Email
        await this.notificationRepository.createNotification(
            detail.user_id,
            `Your reservation for ${detail.date} at ${detail.start_time} has been ${status}`
        );

        return updated;
    }

    async cancel(id: number, userId: number) {
        const detail = await this.reservationRepository.findWithDetails(id);
        if (!detail) throw new AppError("Reservation not found", 404);

        if (detail.user_id !== userId) throw new AppError("Not authorized", 403);

        const canceledId = await getStatusId('CANCELED');
        if (!canceledId) throw new AppError("System configuration error", 500);

        const updated = await this.reservationRepository.update(id, { status_id: canceledId });
        return updated;
    }

    // Legacy support functions if needed, currently not used much
    async createReservation(data: any) { return this.create(data); }
}

export const reservationService = new ReservationService();