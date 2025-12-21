import rateLimit from 'express-rate-limit';
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10000, // Almost unlimited for dev
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        status: 'error',
        message: 'Too many requests, please try again later.'
    }
});
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 100 login requests per hour (increased for dev)
    message: {
        status: 'error',
        message: 'Too many login attempts, please try again later.'
    }
});
//# sourceMappingURL=rateLimiter.js.map