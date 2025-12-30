// USE CASE #1: Membuat atau Masuk Akun - [Model]
// USE CASE #2: Mereset Password - [Model]
// USE CASE #3: Mengelola Profil - [Model]
import { BaseRepository } from './BaseRepository.js';
export class UserRepository extends BaseRepository {
    tableName = 'users';
    primaryKey = 'user_id';
    // [USE CASE #1] Membuat atau Masuk Akun - Cek username
    async findByUsername(username) {
        const query = `SELECT * FROM "${this.tableName}" WHERE username = $1`;
        const result = await this.query(query, [username]);
        return result.rows[0] || null;
    }
    // [USE CASE #1] [USE CASE #2] Validasi Token Sistem (Admin/Reset)
    async validateSystemToken(key, token) {
        const query = `SELECT value FROM system_tokens WHERE key = $1`;
        const result = await this.query(query, [key]);
        const record = result.rows[0];
        if (!record)
            return false;
        return record.value === token;
    }
}
//# sourceMappingURL=UserRepository.js.map