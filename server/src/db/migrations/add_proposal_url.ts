import { pool } from '../index.js';

async function addProposalUrlColumn() {
    const client = await pool.connect();
    try {
        console.log('Adding proposal_url column to reservations table...');

        await client.query(`
            ALTER TABLE reservations 
            ADD COLUMN IF NOT EXISTS proposal_url varchar;
        `);

        console.log('✅ Successfully added proposal_url column to reservations table');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addProposalUrlColumn();
