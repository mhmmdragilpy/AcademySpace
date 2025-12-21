import { createClient } from 'redis';
import logger from '../utils/logger.js';
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redisClient.on('error', (err) => logger.error('Redis Client Error', err));
// Connect to Redis only if environment variable is set or we want to default
// In a real app we might want to await this connection at startup
if (process.env.REDIS_URL || process.env.NODE_ENV === 'development') {
    redisClient.connect().catch(err => {
        logger.warn("Failed to connect to Redis. Caching will be disabled.", err.message);
    });
}
export { redisClient };
//# sourceMappingURL=redis.js.map