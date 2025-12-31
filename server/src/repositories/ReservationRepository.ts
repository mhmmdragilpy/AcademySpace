// USE CASE #6: Melihat Jadwal dan Ketersediaan Fasilitas - [Model]
// USE CASE #7: Mengajukan Reservasi - [Model]
// USE CASE #8: Mengedit atau Membatalkan Reservasi - [Model]
// USE CASE #9: Menyetujui atau Menolak Reservasi - [Model]
// USE CASE #10: Melihat Detail Reservasi - [Model]
// USE CASE #12: Melihat Riwayat Reservasi - [Model]
// USE CASE #14: Melihat Jadwal Reservasi - [Model]
// USE CASE #15: Melihat Analitik dan Pelaporan - [Model]
import { BaseRepository } from "./BaseRepository.js";
import type { Reservation } from '../types/models/index.js';

export class ReservationRepository extends BaseRepository<Reservation> {
    protected tableName = 'reservations';
    protected primaryKey = 'reservation_id';

    // [USE CASE #7] Mengajukan Reservasi - Insert reservasi & item ke DB
    async createWithItem(data: {
        userId: number;
        statusId: number;
        purpose: string;
        attendees: number;
        facilityId?: number;
        startDateTime: string;
        endDateTime: string;
        proposalUrl?: string;
    }) {
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
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // [USE CASE #10] Melihat Detail Reservasi - Query detail dengan join
    async findWithDetails(id: number) {
        const query = `
            SELECT 
                r.reservation_id, 
                u.full_name as user_name, 
                u.username as user_username, 
                f.name as facility_name,
                f.name as facility_raw_name,
                f.capacity as facility_capacity,
                ri.facility_id,
                rs.name as status,
                r.purpose,
                r.proposal_url,
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

    // [USE CASE #14] Melihat Jadwal Reservasi - Query semua reservasi (Admin)
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

    // [USE CASE #12] Melihat Riwayat Reservasi - Query reservasi per user
    async findByUserId(userId: number) {
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
                f.facility_id
            FROM reservations r
            JOIN reservation_items ri ON r.reservation_id = ri.reservation_id
            LEFT JOIN facilities f ON ri.facility_id = f.facility_id
            JOIN reservation_statuses rs ON r.status_id = rs.status_id

            WHERE r.requester_id = $1 
            ORDER BY r.created_at DESC
        `;
        const result = await this.query(query, [userId]);
        return result.rows;
    }

    // [USE CASE #8] Mengedit atau Membatalkan Reservasi - Update data reservasi
    async updateWithDetails(id: number, data: {
        purpose?: string;
        attendees?: number;
        startDateTime?: string;
        endDateTime?: string;
        facilityId?: number;
    }) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');

            // 1. Update Reservation Header
            if (data.purpose !== undefined || data.attendees !== undefined) {
                const updates: any[] = [];
                const values: any[] = [];
                let idx = 1;

                if (data.purpose !== undefined) {
                    updates.push(`purpose = $${idx++}`);
                    values.push(data.purpose);
                }
                if (data.attendees !== undefined) {
                    updates.push(`attendees = $${idx++}`);
                    values.push(data.attendees);
                }

                if (updates.length > 0) {
                    values.push(id);
                    await client.query(
                        `UPDATE reservations SET ${updates.join(', ')} WHERE reservation_id = $${idx}`,
                        values
                    );
                }
            }

            // 2. Update Reservation Item
            if (data.startDateTime || data.endDateTime || data.facilityId) {
                const itemUpdates: any[] = [];
                const itemValues: any[] = [];
                let itemIdx = 1;

                if (data.startDateTime) {
                    itemUpdates.push(`start_datetime = $${itemIdx++}`);
                    itemValues.push(data.startDateTime);
                }
                if (data.endDateTime) {
                    itemUpdates.push(`end_datetime = $${itemIdx++}`);
                    itemValues.push(data.endDateTime);
                }
                if (data.facilityId) {
                    itemUpdates.push(`facility_id = $${itemIdx++}`);
                    itemValues.push(data.facilityId);
                }

                if (itemUpdates.length > 0) {
                    itemValues.push(id);
                    // Assuming 1 item per reservation for now
                    await client.query(
                        `UPDATE reservation_items SET ${itemUpdates.join(', ')} WHERE reservation_id = $${itemIdx}`,
                        itemValues
                    );
                }
            }

            await client.query('COMMIT');

            // Return updated details
            return await this.findWithDetails(id);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // [USE CASE #6] Melihat Jadwal dan Ketersediaan Fasilitas - Cek bentrok waktu
    async findConflicts(facilityId: number, start: string, end: string, excludeReservationId?: number) {
        let query = `
            SELECT ri.item_id 
            FROM reservation_items ri
            JOIN reservations r ON ri.reservation_id = r.reservation_id
            JOIN reservation_statuses rs ON r.status_id = rs.status_id
            WHERE ri.facility_id = $1
            AND rs.name IN ('APPROVED', 'PENDING')
            AND (ri.start_datetime < $3 AND ri.end_datetime > $2)
        `;
        const params: any[] = [facilityId, start, end];

        if (excludeReservationId) {
            query += ` AND r.reservation_id != $4`;
            params.push(excludeReservationId);
        }

        const result = await this.query(query, params);
        return result.rows;
    }
}
