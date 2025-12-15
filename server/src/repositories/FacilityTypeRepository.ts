import { BaseRepository } from './BaseRepository.js';
import type { FacilityType } from '../types/models/index.js';

export class FacilityTypeRepository extends BaseRepository<FacilityType> {
    protected tableName = 'facility_types';
    protected primaryKey = 'type_id';

    async findByName(name: string): Promise<FacilityType | null> {
        const query = `SELECT * FROM "${this.tableName}" WHERE name = $1`;
        const result = await this.query(query, [name]);
        return result.rows[0] || null;
    }
}
