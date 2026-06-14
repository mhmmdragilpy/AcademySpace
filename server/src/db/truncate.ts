import { pool } from './index.js';

async function truncateAll() {
    try {
        console.log('🔄 Mengosongkan semua tabel...\n');

        await pool.query(`
            TRUNCATE TABLE 
                notifications,
                reservation_audit,
                approval_logs,
                reservation_items,
                reservations,
                reservation_statuses,
                facilities,
                buildings,
                facility_types,
                system_tokens,
                users
            CASCADE
        `);

        console.log('✅ Semua tabel berhasil dikosongkan!\n');

        // Verifikasi
        const res = await pool.query(`
            SELECT 'users' as tabel, count(*)::int as jumlah FROM users
            UNION ALL SELECT 'facilities', count(*)::int FROM facilities
            UNION ALL SELECT 'reservations', count(*)::int FROM reservations
            UNION ALL SELECT 'notifications', count(*)::int FROM notifications
            UNION ALL SELECT 'buildings', count(*)::int FROM buildings
            UNION ALL SELECT 'reservation_statuses', count(*)::int FROM reservation_statuses
        `);
        console.table(res.rows);

    } catch (e: any) {
        console.error('❌ Error:', e.message);
    } finally {
        await pool.end();
    }
}

truncateAll();
