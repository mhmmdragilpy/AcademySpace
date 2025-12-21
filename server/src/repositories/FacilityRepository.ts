import { BaseRepository } from './BaseRepository.js';
import type { Facility } from '../types/models/index.js';

export class FacilityRepository extends BaseRepository<Facility> {
    protected tableName = 'facilities';
    protected primaryKey = 'facility_id';

    async findWithDetails(filters: any) {
        let queryText = `
            SELECT 
                f.facility_id, 
                f.name, 
                ft.name as type_name, 
                b.name as building_name, 
                b.building_id,
                f.room_number, 
                f.capacity, 
                f.layout_description, 
                f.photo_url,
                f.floor,
                f.description,
                f.type_id,
                f.is_active,
                f.maintenance_until,
                f.maintenance_reason,
                f.created_at,
                f.updated_at
            FROM facilities f
            LEFT JOIN facility_types ft ON f.type_id = ft.type_id
            LEFT JOIN buildings b ON f.building_id = b.building_id
        `;

        const values: any[] = [];
        let filterConditions: string[] = [];
        let paramIndex = 1;

        // Filter by active status - if includeInactive is false or not provided, only show active OR maintenance
        if (filters.includeInactive !== true) {
            filterConditions.push(`(f.is_active = true OR (f.maintenance_until IS NOT NULL AND f.maintenance_until > NOW()))`);
        }

        if (filters.building) {
            filterConditions.push(`b.name = $${paramIndex}`);
            values.push(filters.building);
            paramIndex++;
        }

        if (filters.type) {
            filterConditions.push(`ft.name = $${paramIndex}`);
            values.push(filters.type);
            paramIndex++;
        }

        if (filters.capacity) {
            filterConditions.push(`f.capacity >= $${paramIndex}`);
            values.push(parseInt(filters.capacity));
            paramIndex++;
        }

        if (filters.search) {
            filterConditions.push(`(f.name ILIKE $${paramIndex} OR b.name ILIKE $${paramIndex} OR f.layout_description ILIKE $${paramIndex})`);
            values.push(`%${filters.search}%`);
            paramIndex++;
        }

        if (filterConditions.length > 0) {
            queryText += " WHERE " + filterConditions.join(" AND ");
        }

        queryText += " ORDER BY f.name ASC";

        const result = await this.query(queryText, values);
        return result.rows;
    }

    async findConflictingFacilityIds(start: string, end: string): Promise<number[]> {
        const query = `
            SELECT DISTINCT ri.facility_id 
            FROM reservation_items ri
            JOIN reservations r ON ri.reservation_id = r.reservation_id
            JOIN reservation_statuses rs ON r.status_id = rs.status_id
            WHERE ri.facility_id IS NOT NULL
            AND rs.name IN ('APPROVED', 'PENDING')
            AND (ri.start_datetime < $2 AND ri.end_datetime > $1)
        `;
        const result = await this.query(query, [start, end]);
        return result.rows.map((row: any) => row.facility_id);
    }
}
