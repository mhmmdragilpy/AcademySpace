// @ts-nocheck - Disable strict type checking for test file due to Jest mock function typing issues
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

// Mock dependencies before imports
jest.unstable_mockModule('../../src/db/index', () => ({
    pool: { query: jest.fn() },
    query: jest.fn(),
}));

jest.unstable_mockModule('../../src/utils/logger', () => ({
    default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

jest.unstable_mockModule('../../src/utils/response', () => ({
    sendSuccess: jest.fn(),
    sendCreated: jest.fn(),
    sendError: jest.fn(),
}));

jest.unstable_mockModule('../../src/utils/catchAsync', () => ({
    catchAsync: (fn: Function) => (req: any, res: any, next: any) => {
        return fn(req, res, next).catch(next);
    }
}));

// Mock reservationService
const mockReservationService = {
    create: jest.fn<() => Promise<any>>(),
    getUserReservations: jest.fn<() => Promise<any>>(),
    getAllReservations: jest.fn<() => Promise<any>>(),
    updateStatus: jest.fn<() => Promise<any>>(),
    update: jest.fn<() => Promise<any>>(),
    cancel: jest.fn<() => Promise<any>>(),
    getById: jest.fn<() => Promise<any>>(),
};
jest.unstable_mockModule('../../src/services/reservationService', () => ({
    reservationService: mockReservationService
}));

// Dynamic imports after mocks
const {
    createReservation,
    getUserReservations,
    getAllReservations,
    updateReservationStatus,
    cancelReservation,
    getReservationById
} = await import('../../src/controllers/reservationController');
const { sendSuccess, sendCreated } = await import('../../src/utils/response');
const { AppError } = await import('../../src/utils/AppError');

// ========================================
// UNIT TEST: validateReservation Function
// ========================================
// Test types and interfaces for validation
interface ReservationInput {
    userId?: number;
    facilityId: number;
    date: string;
    startTime: string;
    endTime: string;
    attendees: number;
}

interface ValidationResult {
    valid: boolean;
    error: string | null;
}

interface Facility {
    id: number;
    name: string;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
    capacity: number;
}

// Mock FacilityRepository
const mockFacilityRepo = {
    findById: jest.fn(),
};

// Mock checkTimeConflict function
const mockCheckTimeConflict = jest.fn();

// Implementation of validateReservation for testing
async function validateReservation(
    reservationData: ReservationInput,
    facilityRepo: typeof mockFacilityRepo,
    checkTimeConflict: typeof mockCheckTimeConflict
): Promise<ValidationResult> {
    // 1. Validasi user
    if (!reservationData.userId) {
        return { valid: false, error: "User ID is required" };
    }

    // 2. Validasi facility
    const facility = await facilityRepo.findById(reservationData.facilityId);
    if (!facility) {
        return { valid: false, error: "Facility not found" };
    }

    // 3. Validasi status facility
    if (facility.status !== "ACTIVE") {
        return { valid: false, error: "Facility is not available" };
    }

    // 4. Validasi tanggal
    const reservationDate = new Date(reservationData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for date comparison
    reservationDate.setHours(0, 0, 0, 0);
    if (reservationDate < today) {
        return { valid: false, error: "Cannot book past date" };
    }

    // 5. Validasi waktu
    if (reservationData.startTime >= reservationData.endTime) {
        return { valid: false, error: "End time must be after start time" };
    }

    // 6. Validasi konflik jadwal
    const hasConflict = await checkTimeConflict(
        reservationData.facilityId,
        reservationData.date,
        reservationData.startTime,
        reservationData.endTime
    );
    if (hasConflict) {
        return { valid: false, error: "Time slot already booked" };
    }

    // 7. Validasi kapasitas
    if (reservationData.attendees > facility.capacity) {
        return { valid: false, error: "Attendees exceed capacity" };
    }

    return { valid: true, error: null };
}

describe('validateReservation', () => {
    const validReservationData: ReservationInput = {
        userId: 1,
        facilityId: 1,
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        startTime: '10:00',
        endTime: '12:00',
        attendees: 10
    };

    const activeFacility: Facility = {
        id: 1,
        name: 'Meeting Room A',
        status: 'ACTIVE',
        capacity: 50
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockFacilityRepo.findById.mockResolvedValue(activeFacility);
        mockCheckTimeConflict.mockResolvedValue(false);
    });

    // Test Case 1: User ID is required
    describe('User ID Validation', () => {
        it('should return error when userId is missing', async () => {
            const dataWithoutUserId = { ...validReservationData, userId: undefined };

            const result = await validateReservation(dataWithoutUserId, mockFacilityRepo, mockCheckTimeConflict);

            expect(result.valid).toBe(false);
            expect(result.error).toBe("User ID is required");
        });

        it('should return error when userId is 0', async () => {
            const dataWithZeroUserId = { ...validReservationData, userId: 0 };

            const result = await validateReservation(dataWithZeroUserId, mockFacilityRepo, mockCheckTimeConflict);

            expect(result.valid).toBe(false);
            expect(result.error).toBe("User ID is required");
        });
    });

    // Test Case 2: Facility not found
    describe('Facility Validation', () => {
        it('should return error when facility is not found', async () => {
            mockFacilityRepo.findById.mockResolvedValue(null);

            const result = await validateReservation(validReservationData, mockFacilityRepo, mockCheckTimeConflict);

            expect(result.valid).toBe(false);
            expect(result.error).toBe("Facility not found");
            expect(mockFacilityRepo.findById).toHaveBeenCalledWith(validReservationData.facilityId);
        });
    });

    // Test Case 3: Facility status validation
    describe('Facility Status Validation', () => {
        it('should return error when facility status is INACTIVE', async () => {
            const inactiveFacility: Facility = { ...activeFacility, status: 'INACTIVE' };
            mockFacilityRepo.findById.mockResolvedValue(inactiveFacility);

            const result = await validateReservation(validReservationData, mockFacilityRepo, mockCheckTimeConflict);

            expect(result.valid).toBe(false);
            expect(result.error).toBe("Facility is not available");
        });

        it('should return error when facility status is MAINTENANCE', async () => {
            const maintenanceFacility: Facility = { ...activeFacility, status: 'MAINTENANCE' };
            mockFacilityRepo.findById.mockResolvedValue(maintenanceFacility);

            const result = await validateReservation(validReservationData, mockFacilityRepo, mockCheckTimeConflict);

            expect(result.valid).toBe(false);
            expect(result.error).toBe("Facility is not available");
        });
    });

    // Test Case 4: Date validation (cannot book past date)
    describe('Date Validation', () => {
        it('should return error when booking past date', async () => {
            const pastDate = new Date(Date.now() - 86400000).toISOString().split('T')[0]; // Yesterday
            const dataWithPastDate = { ...validReservationData, date: pastDate };

            const result = await validateReservation(dataWithPastDate, mockFacilityRepo, mockCheckTimeConflict);

            expect(result.valid).toBe(false);
            expect(result.error).toBe("Cannot book past date");
        });

        it('should allow booking for today', async () => {
            const today = new Date().toISOString().split('T')[0];
            const dataWithToday = { ...validReservationData, date: today };

            const result = await validateReservation(dataWithToday, mockFacilityRepo, mockCheckTimeConflict);

            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
        });

        it('should allow booking for future date', async () => {
            const futureDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]; // 7 days from now
            const dataWithFutureDate = { ...validReservationData, date: futureDate };

            const result = await validateReservation(dataWithFutureDate, mockFacilityRepo, mockCheckTimeConflict);

            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
        });
    });

    // Test Case 5: Time validation (end time must be after start time)
    describe('Time Validation', () => {
        it('should return error when end time equals start time', async () => {
            const dataWithSameTime = { ...validReservationData, startTime: '10:00', endTime: '10:00' };

            const result = await validateReservation(dataWithSameTime, mockFacilityRepo, mockCheckTimeConflict);

            expect(result.valid).toBe(false);
            expect(result.error).toBe("End time must be after start time");
        });

        it('should return error when end time is before start time', async () => {
            const dataWithInvalidTime = { ...validReservationData, startTime: '14:00', endTime: '10:00' };

            const result = await validateReservation(dataWithInvalidTime, mockFacilityRepo, mockCheckTimeConflict);

            expect(result.valid).toBe(false);
            expect(result.error).toBe("End time must be after start time");
        });

        it('should allow when end time is after start time', async () => {
            const dataWithValidTime = { ...validReservationData, startTime: '09:00', endTime: '17:00' };

            const result = await validateReservation(dataWithValidTime, mockFacilityRepo, mockCheckTimeConflict);

            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
        });
    });

    // Test Case 6: Time conflict validation
    describe('Time Conflict Validation', () => {
        it('should return error when time slot is already booked', async () => {
            mockCheckTimeConflict.mockResolvedValue(true);

            const result = await validateReservation(validReservationData, mockFacilityRepo, mockCheckTimeConflict);

            expect(result.valid).toBe(false);
            expect(result.error).toBe("Time slot already booked");
            expect(mockCheckTimeConflict).toHaveBeenCalledWith(
                validReservationData.facilityId,
                validReservationData.date,
                validReservationData.startTime,
                validReservationData.endTime
            );
        });

        it('should pass when no time conflict exists', async () => {
            mockCheckTimeConflict.mockResolvedValue(false);

            const result = await validateReservation(validReservationData, mockFacilityRepo, mockCheckTimeConflict);

            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
        });
    });

    // Test Case 7: Capacity validation
    describe('Capacity Validation', () => {
        it('should return error when attendees exceed facility capacity', async () => {
            const dataWithExcessAttendees = { ...validReservationData, attendees: 100 };
            mockFacilityRepo.findById.mockResolvedValue({ ...activeFacility, capacity: 50 });

            const result = await validateReservation(dataWithExcessAttendees, mockFacilityRepo, mockCheckTimeConflict);

            expect(result.valid).toBe(false);
            expect(result.error).toBe("Attendees exceed capacity");
        });

        it('should allow when attendees equals facility capacity', async () => {
            const dataWithExactCapacity = { ...validReservationData, attendees: 50 };
            mockFacilityRepo.findById.mockResolvedValue({ ...activeFacility, capacity: 50 });

            const result = await validateReservation(dataWithExactCapacity, mockFacilityRepo, mockCheckTimeConflict);

            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
        });

        it('should allow when attendees is less than facility capacity', async () => {
            const dataWithLessAttendees = { ...validReservationData, attendees: 10 };
            mockFacilityRepo.findById.mockResolvedValue({ ...activeFacility, capacity: 50 });

            const result = await validateReservation(dataWithLessAttendees, mockFacilityRepo, mockCheckTimeConflict);

            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
        });
    });

    // Test Case 8: Successful validation (all checks pass)
    describe('Successful Validation', () => {
        it('should return valid true when all validations pass', async () => {
            const result = await validateReservation(validReservationData, mockFacilityRepo, mockCheckTimeConflict);

            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
            expect(mockFacilityRepo.findById).toHaveBeenCalledWith(validReservationData.facilityId);
            expect(mockCheckTimeConflict).toHaveBeenCalled();
        });
    });

    // Test Case 9: Edge cases
    describe('Edge Cases', () => {
        it('should validate in correct order (userId first)', async () => {
            const dataWithMultipleErrors: ReservationInput = {
                userId: undefined,
                facilityId: 999,
                date: '2020-01-01', // Past date
                startTime: '14:00',
                endTime: '10:00', // Invalid time
                attendees: 1000 // Exceeds capacity
            };

            const result = await validateReservation(dataWithMultipleErrors, mockFacilityRepo, mockCheckTimeConflict);

            // Should fail on first validation (userId) and not check others
            expect(result.valid).toBe(false);
            expect(result.error).toBe("User ID is required");
            expect(mockFacilityRepo.findById).not.toHaveBeenCalled();
        });

        it('should handle facility findById error gracefully', async () => {
            mockFacilityRepo.findById.mockRejectedValue(new Error('Database error'));

            await expect(
                validateReservation(validReservationData, mockFacilityRepo, mockCheckTimeConflict)
            ).rejects.toThrow('Database error');
        });
    });
});

describe('ReservationController', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        mockReq = {
            body: {},
            params: {},
            user: { id: 1, role: 'user', username: 'testuser' }
        } as any;
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;
        next = jest.fn();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('createReservation', () => {
        it('should create a reservation successfully', async () => {
            const reservationData = {
                facilityId: 1,
                date: '2025-01-01',
                startTime: '10:00',
                endTime: '12:00',
                purpose: 'Test Meeting'
            };
            mockReq.body = reservationData;

            const mockCreated = { id: 1, userId: 1, ...reservationData, status: 'PENDING' };
            mockReservationService.create.mockResolvedValue(mockCreated);

            await createReservation(mockReq as Request, mockRes as Response, next);

            expect(mockReservationService.create).toHaveBeenCalledWith({
                ...reservationData,
                userId: 1
            });
            expect(sendCreated).toHaveBeenCalledWith(mockRes, mockCreated);
        });
    });

    describe('getUserReservations', () => {
        it('should return user reservations', async () => {
            const mockReservations = [
                { id: 1, purpose: 'Meeting 1' },
                { id: 2, purpose: 'Meeting 2' }
            ];
            mockReservationService.getUserReservations.mockResolvedValue(mockReservations);

            await getUserReservations(mockReq as Request, mockRes as Response, next);

            expect(mockReservationService.getUserReservations).toHaveBeenCalledWith(1);
            expect(sendSuccess).toHaveBeenCalledWith(mockRes, mockReservations);
        });
    });

    describe('getAllReservations', () => {
        it('should return all reservations for admin', async () => {
            const mockReservations = [{ id: 1 }, { id: 2 }, { id: 3 }];
            mockReservationService.getAllReservations.mockResolvedValue(mockReservations);

            await getAllReservations(mockReq as Request, mockRes as Response, next);

            expect(mockReservationService.getAllReservations).toHaveBeenCalled();
            expect(sendSuccess).toHaveBeenCalledWith(mockRes, mockReservations);
        });
    });

    describe('cancelReservation', () => {
        it('should cancel a reservation', async () => {
            mockReq.params = { id: '1' };
            mockReservationService.cancel.mockResolvedValue(undefined);

            await cancelReservation(mockReq as Request, mockRes as Response, next);

            expect(mockReservationService.cancel).toHaveBeenCalledWith(1, 1);
            expect(sendSuccess).toHaveBeenCalledWith(mockRes, { message: 'Reservation cancelled successfully' });
        });
    });

    describe('getReservationById', () => {
        it('should return a reservation by id', async () => {
            mockReq.params = { id: '1' };
            const mockReservation = { id: 1, purpose: 'Test' };
            mockReservationService.getById.mockResolvedValue(mockReservation);

            await getReservationById(mockReq as Request, mockRes as Response, next);

            expect(mockReservationService.getById).toHaveBeenCalledWith(1, 1);
            expect(sendSuccess).toHaveBeenCalledWith(mockRes, mockReservation);
        });

        it('should throw error if reservation not found', async () => {
            mockReq.params = { id: '999' };
            mockReservationService.getById.mockResolvedValue(null);

            await getReservationById(mockReq as Request, mockRes as Response, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });
    });
});
