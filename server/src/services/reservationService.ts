/*
 * ===================================================
 * FILE: server\src\services\reservationService.ts (FINAL LINT FIX)
 * ===================================================
 */
import { pool } from '../index';
import { AppError } from '../utils/AppError';

// Tipe data untuk item yang ingin dipesan (dari frontend)
interface ReservationItemInput {
  facility_id?: number; // Opsional
  equipment_id?: number; // Opsional
  start_datetime: string; // Format ISO 8601
  end_datetime: string; // Format ISO 8601
}

// Tipe data untuk input reservasi utama
interface ReservationInput {
  requester_id: number;
  purpose: string;
  attendees?: number;
  items: ReservationItemInput[]; // Array dari item yang dipesan
}

// Tipe data output untuk ketersediaan
interface BusySlot {
  start_datetime: string;
  end_datetime: string;
}

// ================================================
// --- FUNGSI CREATE DAN GET MY RESERVATIONS (Tidak Berubah) ---
// ================================================

export const createReservation = async (input: ReservationInput) => {
  if (!input.items || input.items.length === 0) {
    throw new AppError('Reservasi harus memiliki setidaknya satu item', 400);
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Cek Ketersediaan (Konflik)
    for (const item of input.items) {
      const conflictCheck = await client.query(
        `SELECT 1 FROM reservation_items
         WHERE 
           (facility_id = $1 OR equipment_id = $2)
           AND
           (start_datetime, end_datetime) OVERLAPS ($3, $4)`,
        [
          item.facility_id || null,
          item.equipment_id || null,
          item.start_datetime,
          item.end_datetime,
        ]
      );

      if (conflictCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        throw new AppError(
          `Jadwal konflik untuk item (Fasilitas: ${item.facility_id}, Alat: ${item.equipment_id}) pada rentang waktu tersebut.`,
          409
        );
      }
    }

    // Buat data 'reservations' (induk)
    const pendingStatusId = 1;

    const reservationResult = await client.query(
      `INSERT INTO reservations (requester_id, status_id, purpose, attendees)
       VALUES ($1, $2, $3, $4)
       RETURNING reservation_id, created_at`,
      [input.requester_id, pendingStatusId, input.purpose, input.attendees || 1]
    );

    const newReservationId = reservationResult.rows[0].reservation_id;

    // Masukkan semua 'items' (anak)
    for (const item of input.items) {
      await client.query(
        `INSERT INTO reservation_items (reservation_id, facility_id, equipment_id, start_datetime, end_datetime)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          newReservationId,
          item.facility_id || null,
          item.equipment_id || null,
          item.start_datetime,
          item.end_datetime,
        ]
      );
    }

    await client.query('COMMIT');

    return {
      reservation_id: newReservationId,
      status: 'PENDING',
      purpose: input.purpose,
      created_at: reservationResult.rows[0].created_at,
      items: input.items,
    };
  } catch (err: unknown) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getMyReservations = async (userId: number) => {
  try {
    const query = `
      SELECT 
        r.reservation_id, 
        r.purpose, 
        r.attendees, 
        r.created_at, 
        r.is_canceled,
        s.name as status_name,
        
        (
          SELECT json_agg(item_details)
          FROM (
            SELECT 
              ri.item_id, 
              ri.start_datetime, 
              ri.end_datetime,
              COALESCE(f.name, e.name) as item_name
            FROM reservation_items ri
            LEFT JOIN facilities f ON ri.facility_id = f.facility_id
            LEFT JOIN equipments e ON ri.equipment_id = e.equipment_id
            WHERE ri.reservation_id = r.reservation_id
          ) as item_details
        ) as items
        
      FROM reservations r
      JOIN reservation_statuses s ON r.status_id = s.status_id
      WHERE r.requester_id = $1
      ORDER BY r.created_at DESC;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows;
  } catch (err: unknown) {
    console.error(err);
    if (err instanceof Error) {
      throw new AppError('Gagal mengambil riwayat reservasi: ' + err.message, 500);
    }
    throw new AppError('Gagal mengambil riwayat reservasi.', 500);
  }
};

export const cancelReservation = async (reservationId: number, userId: number) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const canceledStatusResult = await client.query(
      "SELECT status_id FROM reservation_statuses WHERE name = 'CANCELED'"
    );
    if (canceledStatusResult.rows.length === 0) {
      throw new AppError('Status CANCELED tidak ditemukan di DB.', 500);
    }
    const canceledStatusId = canceledStatusResult.rows[0].status_id;

    const checkResult = await client.query(
      `SELECT status_id, requester_id FROM reservations WHERE reservation_id = $1`,
      [reservationId]
    );

    if (checkResult.rows.length === 0) {
      throw new AppError('Reservasi tidak ditemukan.', 404);
    }

    const currentReservation = checkResult.rows[0];

    if (currentReservation.requester_id !== userId) {
      throw new AppError('Anda tidak memiliki izin untuk membatalkan reservasi ini.', 403);
    }

    if (currentReservation.status_id === canceledStatusId) {
      throw new AppError('Reservasi ini sudah dibatalkan.', 400);
    }

    // 3. Update status reservasi
    // --- PERBAIKAN DITERAPKAN DI SINI ---
    // Baris 192/196: Menghapus deklarasi variabel
    await client.query(
      `UPDATE reservations SET status_id = $1, is_canceled = TRUE WHERE reservation_id = $2 RETURNING reservation_id`,
      [canceledStatusId, reservationId]
    );
    // ------------------------------------

    // 4. Catat aksi ini di 'approval_logs' (self-cancellation)
    // Baris 199: Menghapus deklarasi variabel
    await client.query(
      `INSERT INTO approval_logs (reservation_id, acted_by, "action", "comment")
       VALUES ($1, $2, 'CANCELED', 'Dibatalkan oleh pemesan.')`,
      [reservationId, userId]
    );

    await client.query('COMMIT');

    return {
      message: `Reservasi #${reservationId} berhasil dibatalkan.`,
      status: 'CANCELED',
    };
  } catch (err: unknown) {
    await client.query('ROLLBACK');
    if (err instanceof AppError) throw err;
    if (err instanceof Error) {
      throw new AppError('Gagal membatalkan reservasi: ' + err.message, 500);
    }
    throw new AppError('Gagal membatalkan reservasi.', 500);
  } finally {
    client.release();
  }
};

// ================================================
// --- FUNGSI CHECK AVAILABILITY (Tidak Berubah) ---
// ================================================
export const checkAvailability = async (facilityId: number, date: string): Promise<BusySlot[]> => {
  try {
    const query = `
      SELECT 
        ri.start_datetime, 
        ri.end_datetime
      FROM reservation_items ri
      JOIN reservations r ON ri.reservation_id = r.reservation_id
      JOIN reservation_statuses s ON r.status_id = s.status_id
      WHERE ri.facility_id = $1
        AND DATE(ri.start_datetime) = $2
        AND s.name IN ('PENDING', 'APPROVED')
      ORDER BY ri.start_datetime ASC;
    `;

    const result = await pool.query(query, [facilityId, date]);

    return result.rows;
  } catch (err: unknown) {
    console.error(err);
    if (err instanceof Error) {
      throw new AppError('Gagal mengecek ketersediaan: ' + err.message, 500);
    }
    throw new AppError('Gagal mengecek ketersediaan.', 500);
  }
};
