import { query } from '../index.js';
import logger from '../../utils/logger.js';

async function migrate() {
    try {
        logger.info('Running migration: add_suspend_maintenance');

        // Add is_suspended column to users
        await query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false
        `);
        logger.info('Added is_suspended column to users table');

        // Add maintenance_until column to facilities
        await query(`
            ALTER TABLE facilities 
            ADD COLUMN IF NOT EXISTS maintenance_until TIMESTAMPTZ DEFAULT NULL
        `);
        logger.info('Added maintenance_until column to facilities table');

        // Add maintenance_reason column to facilities  
        await query(`
            ALTER TABLE facilities 
            ADD COLUMN IF NOT EXISTS maintenance_reason TEXT DEFAULT NULL
        `);
        logger.info('Added maintenance_reason column to facilities table');

        logger.info('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        logger.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
