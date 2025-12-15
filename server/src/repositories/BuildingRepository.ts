import { BaseRepository } from './BaseRepository.js';
import type { Building } from '../types/models/index.js';

export class BuildingRepository extends BaseRepository<Building> {
    protected tableName = 'buildings';
    protected primaryKey = 'building_id';

    async findByNameOrCode(nameOrCode: string): Promise<Building | null> {
        const query = `SELECT * FROM "${this.tableName}" WHERE name ILIKE $1 OR code ILIKE $1`;
        const result = await this.query(query, [nameOrCode]);
        return result.rows[0] || null;
    }
}
