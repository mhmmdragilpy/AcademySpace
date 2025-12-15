import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let isOperational = false;

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        isOperational = err.isOperational;
    } else if ((err as any).code === '23505') {
        // Postgres unique violation
        statusCode = 409;
        message = `Duplicate field value: ${(err as any).detail}`;
        isOperational = true;
    } else if ((err as any).code === '23503') {
        // Postgres foreign key violation
        statusCode = 400;
        message = `Foreign key violation: ${(err as any).detail}`;
        isOperational = true;
    }

    // Log error
    if (statusCode >= 500) {
        logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        logger.error(err.stack);
    } else {
        logger.warn(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    }

    // Send response
    sendError(res, statusCode, message, statusCode >= 500 ? 'error' : 'fail');
};
