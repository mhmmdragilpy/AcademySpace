import { jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

// Mock dependencies before imports
jest.unstable_mockModule('../../src/db/index', () => ({
    pool: { query: jest.fn() },
    query: jest.fn(),
}));

jest.unstable_mockModule('../../src/db/redis', () => ({
    redisClient: { isOpen: false, get: jest.fn(), setEx: jest.fn(), del: jest.fn() }
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

// Mock facilityService
const mockFacilityService = {
    findAll: jest.fn<() => Promise<any>>(),
    findById: jest.fn<() => Promise<any>>(),
    create: jest.fn<() => Promise<any>>(),
    update: jest.fn<() => Promise<any>>(),
    delete: jest.fn<() => Promise<any>>(),
};
jest.unstable_mockModule('../../src/services/facilityService', () => ({
    facilityService: mockFacilityService
}));

// Dynamic imports after mocks
const {
    getAllFacilities,
    getFacilityById,
    createFacility,
    updateFacility,
    deleteFacility
} = await import('../../src/controllers/facilityController');
const { sendSuccess, sendCreated } = await import('../../src/utils/response');
const { AppError } = await import('../../src/utils/AppError');

describe('FacilityController', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        mockReq = {
            body: {},
            params: {},
            query: {}
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

    describe('getAllFacilities', () => {
        it('should return all facilities', async () => {
            const mockFacilities = [
                { id: 1, name: 'Room A' },
                { id: 2, name: 'Room B' }
            ];
            mockFacilityService.findAll.mockResolvedValue(mockFacilities);

            await getAllFacilities(mockReq as Request, mockRes as Response, next);

            expect(mockFacilityService.findAll).toHaveBeenCalled();
            expect(sendSuccess).toHaveBeenCalledWith(mockRes, mockFacilities);
        });

        it('should apply filters from query params', async () => {
            mockReq.query = { building: 'GKU', type: 'classroom' };
            mockFacilityService.findAll.mockResolvedValue([]);

            await getAllFacilities(mockReq as Request, mockRes as Response, next);

            expect(mockFacilityService.findAll).toHaveBeenCalledWith(
                expect.objectContaining({ building: 'GKU', type: 'classroom' })
            );
        });
    });

    describe('getFacilityById', () => {
        it('should return a facility by id', async () => {
            mockReq.params = { id: '1' };
            const mockFacility = { id: 1, name: 'Test Room' };
            mockFacilityService.findById.mockResolvedValue(mockFacility);

            await getFacilityById(mockReq as Request, mockRes as Response, next);

            expect(mockFacilityService.findById).toHaveBeenCalledWith(1);
            expect(sendSuccess).toHaveBeenCalledWith(mockRes, mockFacility);
        });

        it('should throw error if facility not found', async () => {
            mockReq.params = { id: '999' };
            mockFacilityService.findById.mockResolvedValue(null);

            await getFacilityById(mockReq as Request, mockRes as Response, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });
    });

    describe('createFacility', () => {
        it('should create a new facility', async () => {
            const facilityData = {
                name: 'New Room',
                type: 'classroom',
                building: 'GKU',
                capacity: 50
            };
            mockReq.body = facilityData;

            const mockCreated = { id: 1, ...facilityData };
            mockFacilityService.create.mockResolvedValue(mockCreated);

            await createFacility(mockReq as Request, mockRes as Response, next);

            expect(mockFacilityService.create).toHaveBeenCalled();
            expect(sendCreated).toHaveBeenCalledWith(mockRes, mockCreated, 'Facility created successfully');
        });
    });

    describe('updateFacility', () => {
        it('should update an existing facility', async () => {
            mockReq.params = { id: '1' };
            mockReq.body = { name: 'Updated Room' };

            const mockUpdated = { id: 1, name: 'Updated Room' };
            mockFacilityService.update.mockResolvedValue(mockUpdated);

            await updateFacility(mockReq as Request, mockRes as Response, next);

            expect(mockFacilityService.update).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'Updated Room' }));
            expect(sendSuccess).toHaveBeenCalledWith(mockRes, mockUpdated, 'Facility updated successfully');
        });

        it('should throw error if facility not found during update', async () => {
            mockReq.params = { id: '999' };
            mockReq.body = { name: 'Updated Room' };
            mockFacilityService.update.mockResolvedValue(null);

            await updateFacility(mockReq as Request, mockRes as Response, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });
    });

    describe('deleteFacility', () => {
        it('should delete a facility', async () => {
            mockReq.params = { id: '1' };
            mockFacilityService.delete.mockResolvedValue(true);

            await deleteFacility(mockReq as Request, mockRes as Response, next);

            expect(mockFacilityService.delete).toHaveBeenCalledWith(1);
            expect(sendSuccess).toHaveBeenCalledWith(mockRes, null, 'Facility deleted successfully');
        });

        it('should throw error if facility not found during delete', async () => {
            mockReq.params = { id: '999' };
            mockFacilityService.delete.mockResolvedValue(false);

            await deleteFacility(mockReq as Request, mockRes as Response, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });
    });
});
