import { jest } from '@jest/globals';
import request from 'supertest';

// Mocks MUST be defined before imports that use them.
// We mock DB connection to prevent real queries
jest.unstable_mockModule('../../src/db/index', () => ({
    pool: { query: jest.fn() },
    query: jest.fn(() => Promise.resolve({ rows: [] })),
}));

// Mock logger to verify error details
jest.unstable_mockModule('../../src/utils/logger', () => ({
    default: { info: jest.fn(), error: console.error },
    logger: { info: jest.fn(), error: console.error }
}));

// Mock Authentication Middleware to bypass real JWT checks
const mockUser = { id: 1, role: 'user', username: 'testuser' };
jest.unstable_mockModule('../../src/middlewares/authMiddleware', () => ({
    authenticateToken: (req: any, res: any, next: any) => {
        req.user = mockUser;
        next();
    },
    authorizeAdmin: (req: any, res: any, next: any) => { next(); },
    authorizeVerificator: (req: any, res: any, next: any) => { next(); }
}));

// Mock Validate Middleware to bypass Zod schema checks
jest.unstable_mockModule('../../src/middlewares/validate', () => ({
    validate: (schema: any) => (req: any, res: any, next: any) => next()
}));

// Mock services to return predictable data
const mockReservationService = {
    create: jest.fn<() => Promise<any>>(),
    getUserReservations: jest.fn<() => Promise<any>>(),
};
jest.unstable_mockModule('../../src/services/reservationService', () => ({
    reservationService: mockReservationService
}));

// Import App
const { app } = await import('../../src/app');

describe('Integration Test: Reservation Flow', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should allow a user to create a reservation', async () => {
        const reservationData = {
            facilityId: 1,
            date: '2025-01-01',
            startTime: '10:00',
            endTime: '12:00',
            purpose: 'Integration Test'
        };

        const mockCreatedReservation = {
            id: 101,
            userId: 1,
            ...reservationData,
            status: 'PENDING'
        };

        mockReservationService.create.mockResolvedValue(mockCreatedReservation);

        const response = await request(app)
            .post('/api/reservations')
            .send(reservationData)
            .set('Authorization', 'Bearer mock-token');

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toEqual(expect.objectContaining({
            id: 101,
            purpose: 'Integration Test'
        }));
        expect(mockReservationService.create).toHaveBeenCalled();
    });

    it('should return user reservations', async () => {
        const mockReservations = [
            { id: 1, purpose: 'Meeting 1' },
            { id: 2, purpose: 'Meeting 2' }
        ];

        mockReservationService.getUserReservations.mockResolvedValue(mockReservations);

        const response = await request(app)
            .get('/api/reservations/my')
            .set('Authorization', 'Bearer mock-token');

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(2);
        expect(mockReservationService.getUserReservations).toHaveBeenCalledWith(1);
    });
});
