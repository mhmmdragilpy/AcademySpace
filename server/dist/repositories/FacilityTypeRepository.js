import { BaseRepository } from './BaseRepository.js';
export class FacilityTypeRepository extends BaseRepository {
    tableName = 'facility_types';
    primaryKey = 'type_id';
    async findByName(name) {
        const query = `SELECT * FROM "${this.tableName}" WHERE name = $1`;
        const result = await this.query(query, [name]);
        return result.rows[0] || null;
    }
}
//# sourceMappingURL=FacilityTypeRepository.js.map