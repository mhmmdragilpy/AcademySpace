import { pool } from '../index.js';

async function addOtherFacilityType() {
    const client = await pool.connect();
    try {
        console.log('Adding "Other" facility type...');

        // Check if already exists
        const checkResult = await client.query(
            `SELECT type_id FROM facility_types WHERE name = 'Other'`
        );

        if (checkResult.rows.length === 0) {
            await client.query(`
                INSERT INTO facility_types (name, description) 
                VALUES ('Other', 'Other facilities not listed above')
            `);
            console.log('✅ Successfully added "Other" facility type');
        } else {
            console.log('ℹ️ "Other" facility type already exists');
        }
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addOtherFacilityType();
