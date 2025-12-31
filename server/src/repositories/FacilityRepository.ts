// USE CASE #4: Mencari Fasilitas - [Model]
// USE CASE #5: Melihat Detail Ruangan - [Model]
// USE CASE #13: Mengelola Fasilitas - [Model]
// USE CASE #18: Menyaring Pencarian Fasilitas - [Model]
import { BaseRepository } from './BaseRepository.js';
import type { Facility } from '../types/models/index.js';

export class FacilityRepository extends BaseRepository<Facility> {
    protected tableName = 'facilities';
    protected primaryKey = 'facility_id';

    // [USE CASE #4] [USE CASE #18] Mencari & Filter Fasilitas - Query dengan Dynamic Filter
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

        // Filter by active status - if includeInactive is false or not provided:
        // - Only show active facilities (is_active = true)
        // - Exclude facilities under maintenance (maintenance_until > NOW())
        if (filters.includeInactive !== true) {
            filterConditions.push(`f.is_active = true`);
            filterConditions.push(`(f.maintenance_until IS NULL OR f.maintenance_until <= NOW())`);
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

    // [USE CASE #6] Ketersediaan Fasilitas - Cek konflik ID fasilitas
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

    // Find facility by slug (name converted to slug format) or by facility_id
    async findBySlug(slug: string, includeInactive: boolean = false) {
        // First, try to find by numeric ID if slug is a number
        const numericId = parseInt(slug);
        if (!isNaN(numericId)) {
            const byIdResult = await this.query(`
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
                WHERE f.facility_id = $1
                ${!includeInactive ? ' AND f.is_active = true' : ''}
                LIMIT 1
            `, [numericId]);
            if (byIdResult.rows[0]) return byIdResult.rows[0];
        }

        // Try to find by slug (name converted to URL-friendly format)
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
            WHERE (LOWER(REGEXP_REPLACE(f.name, '[^a-zA-Z0-9]+', '-', 'g')) = LOWER($1)
                OR LOWER(REGEXP_REPLACE(CONCAT(f.name, '-', b.code), '[^a-zA-Z0-9]+', '-', 'g')) = LOWER($1)
                OR LOWER(REPLACE(REPLACE(f.name, ' ', '-'), '.', '')) = LOWER($1))
        `;

        // Only exclude inactive facilities, but allow maintenance ones (users can view them)
        if (!includeInactive) {
            queryText += ` AND f.is_active = true`;
        }

        queryText += ` LIMIT 1`;

        const result = await this.query(queryText, [slug]);
        return result.rows[0] || null;
    }
}
