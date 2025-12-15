import { query, pool } from './index.js';
import logger from '../utils/logger.js';

async function testConnection() {
    try {
        const start = Date.now();
        const res = await query('SELECT NOW(), current_database()');
        const duration = Date.now() - start;

        logger.info('Database connection successful!');
        logger.info(`Database: ${res.rows[0].current_database}`);
        logger.info(`Time: ${res.rows[0].now}`);
        logger.info(`Latency: ${duration}ms`);

        process.exit(0);
    } catch (err: any) {
        logger.error('Database connection failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

testConnection();
