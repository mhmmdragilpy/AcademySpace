import { facilityService } from "../services/facilityService.js";
import { query } from "../db/index.js";
import { redisClient } from "../db/redis.js";
import logger from "../utils/logger.js";
import { sendSuccess, sendError, sendCreated } from "../utils/response.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
// [USE CASE #4] Mencari Fasilitas - Mendapatkan list fasilitas
// [USE CASE #18] Menyaring Pencarian Fasilitas - Filter berdasarkan tipe
export const getAllFacilities = catchAsync(async (req, res) => {
    const filters = {
        building: req.query.building,
        type: req.query.type,
        capacity: req.query.capacity,
        date: req.query.date,
        startTime: req.query.startTime,
        endTime: req.query.endTime,
        search: req.query.search,
        includeInactive: req.query.includeInactive === 'true'
    };
    const result = await facilityService.findAll(filters);
    sendSuccess(res, result);
});
// [USE CASE #5] Melihat Detail Ruangan - Mendapatkan detail fasilitas by ID
export const getFacilityById = catchAsync(async (req, res) => {
    const id = parseInt(req.params.id || "0");
    const cacheKey = `facility:${id}`;
    // Try to fetch from Redis
    try {
        if (redisClient.isOpen) {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                logger.info(`Cache hit for facility ${id}`);
                // Don't forget caching assumes JSON
                return sendSuccess(res, JSON.parse(cachedData));
            }
        }
    }
    catch (redisError) {
        logger.warn("Redis error:", redisError);
    }
    const result = await facilityService.findById(id);
    if (!result) {
        throw new AppError("Facility not found", 404);
    }
    // Cache the result for 1 hour
    try {
        if (redisClient.isOpen) {
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));
        }
    }
    catch (redisError) {
        logger.warn("Redis write error:", redisError);
    }
    sendSuccess(res, result);
});
// Get facility by slug (name converted to URL-friendly format)
export const getFacilityBySlug = catchAsync(async (req, res) => {
    const slug = req.params.slug || "";
    const result = await facilityService.findBySlug(slug);
    if (!result) {
        throw new AppError("Facility not found", 404);
    }
    sendSuccess(res, result);
});
// [USE CASE #13] Mengelola Fasilitas - Menambahkan fasilitas baru (Admin)
export const createFacility = catchAsync(async (req, res) => {
    // Input already validated by middleware (zod)
    // Support both legacy (type, building) and new (type_id, building_id) formats
    const { name, type, type_id, building, building_id, roomNumber, room_number, capacity, description, layout_description, imageUrl, photo_url, floor, is_active } = req.body;
    const newFacility = await facilityService.create({
        name,
        type,
        type_id,
        building,
        building_id,
        room_number: room_number || roomNumber,
        capacity,
        floor,
        description,
        layout_description,
        photo_url: photo_url || imageUrl,
        is_active,
    });
    sendCreated(res, newFacility, "Facility created successfully");
});
// [USE CASE #13] Mengelola Fasilitas - Mengupdate data fasilitas (Admin)
export const updateFacility = catchAsync(async (req, res) => {
    const id = parseInt(req.params.id || "0");
    const validatedData = req.body;
    const updateData = { ...validatedData };
    // Logic kept to be super safe compat
    if (validatedData.roomNumber) {
        updateData.room_number = validatedData.roomNumber;
        delete updateData.roomNumber;
    }
    if (validatedData.imageUrl) {
        updateData.photo_url = updateData.photo_url || validatedData.imageUrl;
        delete updateData.imageUrl;
    }
    const updatedFacility = await facilityService.update(id, updateData);
    if (!updatedFacility) {
        throw new AppError("Facility not found", 404);
    }
    // Invalidate cache
    try {
        if (redisClient.isOpen) {
            await redisClient.del(`facility:${id}`);
        }
    }
    catch (e) {
        console.error("Redis cache error", e);
    }
    sendSuccess(res, updatedFacility, "Facility updated successfully");
});
// [USE CASE #13] Mengelola Fasilitas - Menghapus fasilitas (Admin)
export const deleteFacility = catchAsync(async (req, res) => {
    const id = parseInt(req.params.id || "0");
    const deleted = await facilityService.delete(id);
    if (!deleted) {
        throw new AppError("Facility not found", 404);
    }
    // Invalidate cache
    try {
        if (redisClient.isOpen) {
            await redisClient.del(`facility:${id}`);
        }
    }
    catch (e) {
        console.error("Redis cache error", e);
    }
    sendSuccess(res, null, "Facility deleted successfully");
});
// This one still uses direct query, should be moved to service/repo ideally
// But prioritizing main CRUD refactor for now.
// Let's at least wrap it.
export const getFacilityReservations = catchAsync(async (req, res) => {
    const id = parseInt(req.params.id || "0");
    const { date } = req.query;
    const params = [id];
    let queryText = `
        SELECT 
            r.reservation_id as id, 
            to_char(ri.start_datetime, 'HH24:MI') as "startTime", 
            to_char(ri.end_datetime, 'HH24:MI') as "endTime", 
            u.full_name as "bookedBy", 
            r.purpose
        FROM reservations r
        JOIN reservation_items ri ON r.reservation_id = ri.reservation_id
        JOIN users u ON r.requester_id = u.user_id
        JOIN reservation_statuses rs ON r.status_id = rs.status_id
        WHERE ri.facility_id = $1 
        AND rs.name NOT IN ('REJECTED', 'CANCELED')
    `;
    if (date) {
        queryText += ` AND to_char(ri.start_datetime, 'YYYY-MM-DD') = $2`;
        params.push(date);
    }
    const result = await query(queryText, params);
    sendSuccess(res, result.rows);
});
// Set facility maintenance (admin only)
export const setMaintenance = catchAsync(async (req, res) => {
    const id = parseInt(req.params.id || "0");
    const { maintenance_until, maintenance_reason } = req.body;
    const facility = await facilityService.findById(id);
    if (!facility) {
        throw new AppError("Facility not found", 404);
    }
    // Default maintenance duration: 7 days if not specified
    const defaultMaintenanceUntil = new Date();
    defaultMaintenanceUntil.setDate(defaultMaintenanceUntil.getDate() + 7);
    // Update maintenance status
    const updateData = {
        is_active: true, // Keep it visible so users know it's under maintenance
        maintenance_until: maintenance_until || defaultMaintenanceUntil,
        maintenance_reason: maintenance_reason || "Under maintenance"
    };
    const updated = await facilityService.update(id, updateData);
    if (!updated) {
        throw new AppError("Failed to set maintenance", 500);
    }
    // Invalidate cache
    try {
        if (redisClient.isOpen) {
            await redisClient.del(`facility:${id}`);
        }
    }
    catch (e) {
        console.error("Redis cache error", e);
    }
    sendSuccess(res, updated, "Facility set to maintenance mode");
});
// Clear facility maintenance (admin only)
export const clearMaintenance = catchAsync(async (req, res) => {
    const id = parseInt(req.params.id || "0");
    const facility = await facilityService.findById(id);
    if (!facility) {
        throw new AppError("Facility not found", 404);
    }
    // Clear maintenance status
    const updateData = {
        is_active: true,
        maintenance_until: null,
        maintenance_reason: null
    };
    const updated = await facilityService.update(id, updateData);
    if (!updated) {
        throw new AppError("Failed to clear maintenance", 500);
    }
    // Invalidate cache
    try {
        if (redisClient.isOpen) {
            await redisClient.del(`facility:${id}`);
        }
    }
    catch (e) {
        console.error("Redis cache error", e);
    }
    sendSuccess(res, updated, "Facility maintenance cleared");
});
//# sourceMappingURL=facilityController.js.map