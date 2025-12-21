import type { Request, Response } from "express";
import { reservationService } from "../services/reservationService.js";
import { query } from "../db/index.js";
import logger from "../utils/logger.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendSuccess, sendCreated, sendError } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";

// Schemas are used in rules, but controllers here just take validated body
// (assuming middleware is applied in routes)

export const createReservation = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const data = req.body;

    const newReservation = await reservationService.create({
        ...data,
        userId
    });

    sendCreated(res, newReservation);
});

export const getUserReservations = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const reservations = await reservationService.getUserReservations(userId);
    sendSuccess(res, reservations);
});

export const getAllReservations = catchAsync(async (req: Request, res: Response) => {
    const reservations = await reservationService.getAllReservations();
    sendSuccess(res, reservations);
});

export const updateReservationStatus = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const { status } = req.body;

    const updated = await reservationService.updateStatus(id, status);
    sendSuccess(res, updated);
});

export const updateReservation = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const id = parseInt(req.params.id || "0");
    const data = req.body;

    const updated = await reservationService.update(id, userId, data);
    sendSuccess(res, updated);
});

export const cancelReservation = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const id = parseInt(req.params.id || "0");

    await reservationService.cancel(id, userId);
    sendSuccess(res, { message: "Reservation cancelled successfully" });
});

export const getReservationById = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const userId = (req as any).user.id;

    // Optional: Pass userId to service if you want to enforce ownership there
    // For now, service.getById gets the details, we can check auth here or trust service
    const reservation = await reservationService.getById(id, userId);

    if (!reservation) {
        throw new AppError("Reservation not found", 404);
    }

    sendSuccess(res, reservation);
});

export const getReservationStats = catchAsync(async (req: Request, res: Response) => {
    // Keep using direct queries for Dashboard-like stats for now, 
    // or move to a dashboard service. To keep it simple and working:

    // Get overall statistics
    const totalReservationsResult = await query(
        `SELECT COUNT(*) as count FROM reservations`
    );

    const approvedReservationsResult = await query(
        `SELECT COUNT(*) as count FROM reservations r 
             JOIN reservation_statuses rs ON r.status_id = rs.status_id 
             WHERE rs.name = 'APPROVED'`
    );

    const pendingReservationsResult = await query(
        `SELECT COUNT(*) as count FROM reservations r 
             JOIN reservation_statuses rs ON r.status_id = rs.status_id 
             WHERE rs.name = 'PENDING'`
    );

    const rejectedReservationsResult = await query(
        `SELECT COUNT(*) as count FROM reservations r 
             JOIN reservation_statuses rs ON r.status_id = rs.status_id 
             WHERE rs.name = 'REJECTED'`
    );

    // Get statistics for the past 30 days
    const recentReservationsResult = await query(
        `SELECT COUNT(*) as count FROM reservations WHERE created_at >= NOW() - INTERVAL '30 days'`
    );

    // Get top facilities by reservation count
    const topFacilitiesResult = await query(
        `SELECT f.name as facility_name, COUNT(r.reservation_id) as reservation_count
             FROM reservations r
             JOIN reservation_statuses rs ON r.status_id = rs.status_id
             JOIN reservation_items ri ON r.reservation_id = ri.reservation_id
             JOIN facilities f ON ri.facility_id = f.facility_id
             WHERE rs.name = 'APPROVED'
             GROUP BY f.facility_id, f.name
             ORDER BY reservation_count DESC
             LIMIT 5`
    );

    sendSuccess(res, {
        totalReservations: parseInt(totalReservationsResult.rows[0].count),
        approvedReservations: parseInt(approvedReservationsResult.rows[0].count),
        pendingReservations: parseInt(pendingReservationsResult.rows[0].count),
        rejectedReservations: parseInt(rejectedReservationsResult.rows[0].count),
        recentReservations: parseInt(recentReservationsResult.rows[0].count),
        topFacilities: topFacilitiesResult.rows
    });
});

export const getFacilityUtilization = catchAsync(async (req: Request, res: Response) => {
    // Keep existing query logic for now
    const facilityUtilizationResult = await query(
        `SELECT
            f.facility_id as id,
            f.name as facility_name,
            ft.name as facility_type,
            b.name as building,
            f.capacity,
            COUNT(r.reservation_id) as total_reservations,
            AVG(r.attendees) as avg_participants
         FROM facilities f
         LEFT JOIN facility_types ft ON f.type_id = ft.type_id
         LEFT JOIN buildings b ON f.building_id = b.building_id
         LEFT JOIN reservation_items ri ON f.facility_id = ri.facility_id
         LEFT JOIN reservations r ON ri.reservation_id = r.reservation_id
         LEFT JOIN reservation_statuses rs ON r.status_id = rs.status_id
         WHERE rs.name = 'APPROVED' OR rs.name IS NULL
         GROUP BY f.facility_id, f.name, ft.name, b.name, f.capacity
         ORDER BY total_reservations DESC`
    );

    const dailyUtilizationResult = await query(
        `SELECT
            to_char(ri.start_datetime, 'YYYY-MM-DD') as date,
            COUNT(*) as reservation_count
         FROM reservation_items ri
         JOIN reservations r ON ri.reservation_id = r.reservation_id
         JOIN reservation_statuses rs ON r.status_id = rs.status_id
         WHERE rs.name = 'APPROVED'
         AND r.created_at >= NOW() - INTERVAL '7 days'
         GROUP BY date
         ORDER BY date DESC`
    );

    sendSuccess(res, {
        facilitiesUtilization: facilityUtilizationResult.rows,
        dailyUtilization: dailyUtilizationResult.rows
    });
});

export const getUserActivity = catchAsync(async (req: Request, res: Response) => {
    const activeUsersResult = await query(
        `SELECT
            u.full_name as name,
            u.username,
            'N/A' as department,
            COUNT(r.reservation_id) as reservation_count
         FROM users u
         LEFT JOIN reservations r ON u.user_id = r.requester_id
         LEFT JOIN reservation_statuses rs ON r.status_id = rs.status_id
         WHERE rs.name = 'APPROVED'
         GROUP BY u.user_id, u.full_name, u.username
         ORDER BY reservation_count DESC
         LIMIT 10`
    );

    const weeklyActivityResult = await query(
        `SELECT
            EXTRACT(DOW FROM ri.start_datetime) as day_of_week,
            COUNT(*) as reservation_count
         FROM reservation_items ri
         JOIN reservations r ON ri.reservation_id = r.reservation_id
         JOIN reservation_statuses rs ON r.status_id = rs.status_id
         WHERE rs.name = 'APPROVED'
         GROUP BY day_of_week
         ORDER BY day_of_week`
    );

    sendSuccess(res, {
        activeUsers: activeUsersResult.rows,
        weeklyActivity: weeklyActivityResult.rows
    });
});
