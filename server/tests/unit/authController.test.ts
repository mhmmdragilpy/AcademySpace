// @ts-nocheck - Disable strict type checking for test file due to Jest mock function typing issues
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import type { AppError } from '../../src/utils/AppError';

// Mocks using unstable_mockModule for ESM support

jest.unstable_mockModule('../../src/db/index', () => ({
    pool: { query: jest.fn() },
    query: jest.fn(),
}));

jest.unstable_mockModule('../../src/utils/logger', () => ({
    default: { info: jest.fn(), error: jest.fn() }
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

const mockBcrypt = {
    compare: jest.fn(),
    hash: jest.fn(),
    genSalt: jest.fn(),
};
jest.unstable_mockModule('bcryptjs', () => ({
    __esModule: true,
    default: mockBcrypt,
    ...mockBcrypt
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
    default: { sign: jest.fn().mockReturnValue('mock-token') },
    sign: jest.fn().mockReturnValue('mock-token')
}));

// Dynamic imports are required after unstable_mockModule
const { login } = await import('../../src/controllers/authController');
const { userService } = await import('../../src/services/userService');
const { sendSuccess } = await import('../../src/utils/response');
// We don't need dynamic import for AppError value if we only use it for instance checks which work if we import class? 
// No, we need the VALUE for `expect.any(AppError)`.
const { AppError: AppErrorValue } = await import('../../src/utils/AppError');
const { default: bcrypt } = await import('bcryptjs');

describe('AuthController - Login', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        mockReq = {
            body: {
                username: 'testuser',
                password: 'password123'
            }
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;
        next = jest.fn();
        jest.clearAllMocks();

        jest.spyOn(userService, 'findByUsername').mockResolvedValue(null);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should login successfully with valid credentials', async () => {
        const mockUser = {
            user_id: 1,
            username: 'testuser',
            password_hash: 'hashedpassword',
            role: 'user',
            is_suspended: false
        };

        jest.spyOn(userService, 'findByUsername').mockResolvedValue(mockUser as any);
        // Use mockImplementation to avoid casting issues with mockResolvedValue
        (bcrypt.compare as jest.Mock).mockImplementation(() => Promise.resolve(true));

        await login(mockReq as Request, mockRes as Response, next);

        expect(next).not.toHaveBeenCalled();
        expect(sendSuccess).toHaveBeenCalledWith(
            mockRes,
            expect.objectContaining({
                token: 'mock-token',
                user: expect.objectContaining({ username: 'testuser' })
            }),
            'Login successful'
        );
    });

    it('should throw error if user not found', async () => {
        jest.spyOn(userService, 'findByUsername').mockResolvedValue(null);

        await login(mockReq as Request, mockRes as Response, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppErrorValue));
        const error = (next as jest.Mock).mock.calls[0][0] as AppError;
        expect(error.message).toBe('Invalid credentials');
    });

    it('should throw error if password is invalid', async () => {
        const mockUser = {
            user_id: 1,
            username: 'testuser',
            password_hash: 'hashedpassword',
            role: 'user',
            is_suspended: false
        };

        jest.spyOn(userService, 'findByUsername').mockResolvedValue(mockUser as any);
        (bcrypt.compare as jest.Mock).mockImplementation(() => Promise.resolve(false));

        await login(mockReq as Request, mockRes as Response, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppErrorValue));
        const error = (next as jest.Mock).mock.calls[0][0] as AppError;
        expect(error.message).toBe('Invalid credentials');
    });
});
