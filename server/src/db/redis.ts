import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', () => {
    // Silently ignore Redis errors — Redis is optional
});

// Only connect to Redis if REDIS_URL is explicitly configured
if (process.env.REDIS_URL) {
    redisClient.connect().catch(err => {
        logger.warn("Failed to connect to Redis. Caching will be disabled.", err.message);
    });
} else {
    logger.info("⚠️ Redis not configured (REDIS_URL not set). Caching disabled.");
}

export { redisClient };
