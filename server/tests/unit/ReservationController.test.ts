import { jest } from '@jest/globals';
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
