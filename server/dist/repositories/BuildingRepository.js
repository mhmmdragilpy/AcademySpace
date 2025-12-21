import { BaseRepository } from './BaseRepository.js';
export class BuildingRepository extends BaseRepository {
    tableName = 'buildings';
    primaryKey = 'building_id';
    async findByNameOrCode(nameOrCode) {
        const query = `SELECT * FROM "${this.tableName}" WHERE name ILIKE $1 OR code ILIKE $1`;
        const result = await this.query(query, [nameOrCode]);
        return result.rows[0] || null;
    }
}
//# sourceMappingURL=BuildingRepository.js.map