import { BaseRepository } from './BaseRepository.js';
export class ReservationRepository extends BaseRepository {
    tableName = 'reservations';
    primaryKey = 'reservation_id';
    async createWithItem(data) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');
            // 1. Create Reservation Header
            const resQuery = `
                INSERT INTO reservations (requester_id, status_id, purpose, attendees, proposal_url)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            const resResult = await client.query(resQuery, [
                data.userId,
                data.statusId,
                data.purpose,
                data.attendees,
                data.proposalUrl || null
            ]);
            const reservation = resResult.rows[0];
            // 2. Create Reservation Item
            const itemQuery = `
                INSERT INTO reservation_items (reservation_id, facility_id, start_datetime, end_datetime)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            await client.query(itemQuery, [
                reservation.reservation_id,
                data.facilityId || null,
                data.startDateTime,
                data.endDateTime
            ]);
            await client.query('COMMIT');
            return reservation;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async findWithDetails(id) {
        const query = `
            SELECT 
                r.reservation_id, 
                u.full_name as user_name, 
                u.username as user_username, 
                f.name as facility_name,
                f.name as facility_raw_name,
                rs.name as status,
                r.purpose,
                r.requester_id as user_id,
                r.attendees,
                to_char(ri.start_datetime, 'YYYY-MM-DD') as date,
                to_char(ri.start_datetime, 'HH24:MI') as start_time,
                to_char(ri.end_datetime, 'HH24:MI') as end_time,
                ri.start_datetime as start_datetime_raw,
                ri.end_datetime as end_datetime_raw,
                r.created_at
            FROM reservations r
            JOIN users u ON r.requester_id = u.user_id
            JOIN reservation_items ri ON r.reservation_id = ri.reservation_id
            LEFT JOIN facilities f ON ri.facility_id = f.facility_id
            JOIN reservation_statuses rs ON r.status_id = rs.status_id
            WHERE r.reservation_id = $1
        `;
        const result = await this.query(query, [id]);
        return result.rows[0] || null;
    }
    async findAllWithDetails() {
        const query = `
            SELECT 
                r.reservation_id, 
                u.full_name as user_name, 
                u.username as user_username, 
                f.name as facility_name,
                rs.name as status,
                r.purpose,
                r.proposal_url,
                to_char(ri.start_datetime, 'YYYY-MM-DD') as date,
                to_char(ri.start_datetime, 'HH24:MI') as start_time,
                to_char(ri.end_datetime, 'HH24:MI') as end_time,
                r.attendees
            FROM reservations r
            JOIN users u ON r.requester_id = u.user_id
            JOIN reservation_items ri ON r.reservation_id = ri.reservation_id
            LEFT JOIN facilities f ON ri.facility_id = f.facility_id
            JOIN reservation_statuses rs ON r.status_id = rs.status_id
            ORDER BY r.created_at DESC
        `;
        const result = await this.query(query);
        return result.rows;
    }
    async findByUserId(userId) {
        const query = `
            SELECT 
                r.reservation_id, 
                f.name as facility_name,
                rs.name as status,
                r.purpose,
                to_char(ri.start_datetime, 'YYYY-MM-DD') as date,
                to_char(ri.start_datetime, 'HH24:MI') as start_time,
                to_char(ri.end_datetime, 'HH24:MI') as end_time,
                r.created_at,
                f.facility_id,
                CASE WHEN rt.rating_id IS NOT NULL THEN true ELSE false END as is_rated
            FROM reservations r
            JOIN reservation_items ri ON r.reservation_id = ri.reservation_id
            LEFT JOIN facilities f ON ri.facility_id = f.facility_id
            JOIN reservation_statuses rs ON r.status_id = rs.status_id
            LEFT JOIN ratings rt ON r.reservation_id = rt.reservation_id
            WHERE r.requester_id = $1 
            ORDER BY r.created_at DESC
        `;
        const result = await this.query(query, [userId]);
        return result.rows;
    }
    async findConflicts(facilityId, start, end) {
        const query = `
            SELECT ri.item_id 
            FROM reservation_items ri
            JOIN reservations r ON ri.reservation_id = r.reservation_id
            JOIN reservation_statuses rs ON r.status_id = rs.status_id
            WHERE ri.facility_id = $1
            AND rs.name IN ('APPROVED', 'PENDING')
            AND (ri.start_datetime < $3 AND ri.end_datetime > $2)
        `;
        const result = await this.query(query, [facilityId, start, end]);
        return result.rows;
    }
}
//# sourceMappingURL=ReservationRepository.js.map