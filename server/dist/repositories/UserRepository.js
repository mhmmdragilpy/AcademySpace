import { BaseRepository } from './BaseRepository.js';
export class UserRepository extends BaseRepository {
    tableName = 'users';
    primaryKey = 'user_id';
    async findByUsername(username) {
        const query = `SELECT * FROM "${this.tableName}" WHERE username = $1`;
        const result = await this.query(query, [username]);
        return result.rows[0] || null;
    }
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