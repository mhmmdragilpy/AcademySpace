import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';
export const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let isOperational = false;
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        isOperational = err.isOperational;
    }
    else if (err.code === '23505') {
        // Postgres unique violation
        statusCode = 409;
        message = `Duplicate field value: ${err.detail}`;
        isOperational = true;
    }
    else if (err.code === '23503') {
        // Postgres foreign key violation
        statusCode = 400;
        message = `Foreign key violation: ${err.detail}`;
        isOperational = true;
    }
    // Log error
    if (statusCode >= 500) {
        logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        logger.error(err.stack);
    }
    else {
        logger.warn(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    }
    // Send response
    sendError(res, statusCode, message, statusCode >= 500 ? 'error' : 'fail');
};
//# sourceMappingURL=errorHandler.js.map