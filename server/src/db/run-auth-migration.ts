import { pool } from './index.js';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    try {
        const migrationPath = path.join(process.cwd(), 'src/db/migrations/auth_refactor.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running auth refactor migration...');
        await pool.query(sql);
        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
}

runMigration();
