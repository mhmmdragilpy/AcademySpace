import { pool } from './index.js';

async function restoreTokens() {
    try {
        await pool.query(`
            INSERT INTO system_tokens (key, value, description) VALUES
            ('ADMIN_REG_TOKEN', 'ADM-SECRET-TOKEN-FIXED', 'Token untuk registrasi admin'),
            ('RESET_PASS_TOKEN', 'RESET-SECRET-TOKEN-FIXED', 'Token untuk reset password')
            ON CONFLICT (key) DO NOTHING
        `);

        const res = await pool.query('SELECT * FROM system_tokens');
        console.log('✅ System tokens berhasil di-restore!\n');
        console.table(res.rows);
    } catch (e: any) {
        console.error('❌ Error:', e.message);
    } finally {
        await pool.end();
    }
}

restoreTokens();
