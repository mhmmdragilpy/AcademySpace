import fs from 'fs';
import path from 'path';
import { pool } from './index.js';
import { logger } from '../utils/logger.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
    try {
        logger.info("Starting database migrations...");

        // Ensure migrations table exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Get list of migration files
        const migrationsDir = path.join(__dirname, 'migrations');
        if (fs.existsSync(migrationsDir)) {
            const files = fs.readdirSync(migrationsDir).sort();

            for (const file of files) {
                if (file.endsWith('.sql')) {
                    const filePath = path.join(migrationsDir, file);

                    // Check if already executed
                    const checkResult = await pool.query('SELECT id FROM migrations WHERE name = $1', [file]);
                    if (checkResult.rowCount === 0) {
                        logger.info(`Running migration: ${file}`);
                        const sql = fs.readFileSync(filePath, 'utf-8');
                        await pool.query(sql);
                        await pool.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
                        logger.info(`Completed migration: ${file}`);
                    } else {
                        logger.info(`Skipping migration (already executed): ${file}`);
                    }
                }
            }
        } else {
            logger.warn("No migrations directory found.");
        }

        logger.info("Migrations finished successfully.");
        process.exit(0);
    } catch (error) {
        logger.error("Migration failed:", error);
        process.exit(1);
    }
}

runMigrations();
