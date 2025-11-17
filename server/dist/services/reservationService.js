"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAvailability = exports.cancelReservation = exports.getMyReservations = exports.createReservation = void 0;
/*
 * ===================================================
 * FILE: server/src/services/reservationService.ts (UPDATE: AVAILABILITY CHECK)
 * ===================================================
 */
const index_1 = require("../index");
const AppError_1 = require("../utils/AppError");
// ================================================
// --- FUNGSI CREATE DAN GET MY RESERVATIONS (Tidak Berubah) ---
// ================================================
const createReservation = (input) => __awaiter(void 0, void 0, void 0, function* () {
    // ... (Kode lengkap createReservation Anda) ...
    if (!input.items || input.items.length === 0) {
        throw new AppError_1.AppError('Reservasi harus memiliki setidaknya satu item', 400);
    }
    const client = yield index_1.pool.connect();
    try {
        yield client.query('BEGIN');
        // Cek Ketersediaan (Konflik)
        for (const item of input.items) {
            const conflictCheck = yield client.query(`SELECT 1 FROM reservation_items
         WHERE 
           (facility_id = $1 OR equipment_id = $2)
           AND
           (start_datetime, end_datetime) OVERLAPS ($3, $4)`, [
                item.facility_id || null,
                item.equipment_id || null,
                item.start_datetime,
                item.end_datetime,
            ]);
            if (conflictCheck.rows.length > 0) {
                yield client.query('ROLLBACK');
                throw new AppError_1.AppError(`Jadwal konflik untuk item (Fasilitas: ${item.facility_id}, Alat: ${item.equipment_id}) pada rentang waktu tersebut.`, 409 // 409 Conflict
                );
            }
        }
        // Buat data 'reservations' (induk)
        const pendingStatusId = 1; // Asumsi 1 = PENDING
        const reservationResult = yield client.query(`INSERT INTO reservations (requester_id, status_id, purpose, attendees)
       VALUES ($1, $2, $3, $4)
       RETURNING reservation_id, created_at`, [input.requester_id, pendingStatusId, input.purpose, input.attendees || 1]);
        const newReservationId = reservationResult.rows[0].reservation_id;
        // Masukkan semua 'items' (anak)
        for (const item of input.items) {
            yield client.query(`INSERT INTO reservation_items (reservation_id, facility_id, equipment_id, start_datetime, end_datetime)
         VALUES ($1, $2, $3, $4, $5)`, [
                newReservationId,
                item.facility_id || null,
                item.equipment_id || null,
                item.start_datetime,
                item.end_datetime,
            ]);
        }
        yield client.query('COMMIT');
        return {
            reservation_id: newReservationId,
            status: 'PENDING',
            purpose: input.purpose,
            created_at: reservationResult.rows[0].created_at,
            items: input.items,
        };
    }
    catch (err) {
        yield client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
});
exports.createReservation = createReservation;
const getMyReservations = (userId) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield index_1.pool.query(query, [userId]);
        return result.rows;
    }
    catch (err) {
        console.error(err);
        if (err instanceof Error) {
            throw new AppError_1.AppError('Gagal mengambil riwayat reservasi: ' + err.message, 500);
        }
        throw new AppError_1.AppError('Gagal mengambil riwayat reservasi.', 500);
    }
});
exports.getMyReservations = getMyReservations;
const cancelReservation = (reservationId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // ... (Kode lengkap cancelReservation Anda) ...
    const client = yield index_1.pool.connect();
    try {
        yield client.query('BEGIN');
        const canceledStatusResult = yield client.query("SELECT status_id FROM reservation_statuses WHERE name = 'CANCELED'");
        if (canceledStatusResult.rows.length === 0) {
            throw new AppError_1.AppError('Status CANCELED tidak ditemukan di DB.', 500);
        }
        const canceledStatusId = canceledStatusResult.rows[0].status_id;
        const checkResult = yield client.query(`SELECT status_id, requester_id FROM reservations WHERE reservation_id = $1`, [reservationId]);
        if (checkResult.rows.length === 0) {
            throw new AppError_1.AppError('Reservasi tidak ditemukan.', 404);
        }
        const currentReservation = checkResult.rows[0];
        if (currentReservation.requester_id !== userId) {
            throw new AppError_1.AppError('Anda tidak memiliki izin untuk membatalkan reservasi ini.', 403);
        }
        if (currentReservation.status_id === canceledStatusId) {
            throw new AppError_1.AppError('Reservasi ini sudah dibatalkan.', 400);
        }
        const updateResult = yield client.query(`UPDATE reservations SET status_id = $1, is_canceled = TRUE WHERE reservation_id = $2 RETURNING reservation_id`, [canceledStatusId, reservationId]);
        yield client.query(`INSERT INTO approval_logs (reservation_id, acted_by, "action", "comment")
       VALUES ($1, $2, 'CANCELED', 'Dibatalkan oleh pemesan.')`, [reservationId, userId]);
        yield client.query('COMMIT');
        return {
            message: `Reservasi #${reservationId} berhasil dibatalkan.`,
            status: 'CANCELED'
        };
    }
    catch (err) {
        yield client.query('ROLLBACK');
        if (err instanceof AppError_1.AppError)
            throw err;
        if (err instanceof Error) {
            throw new AppError_1.AppError('Gagal membatalkan reservasi: ' + err.message, 500);
        }
        throw new AppError_1.AppError('Gagal membatalkan reservasi.', 500);
    }
    finally {
        client.release();
    }
});
exports.cancelReservation = cancelReservation;
// ================================================
// --- FUNGSI BARU DIMULAI DI SINI ---
// ================================================
/**
 * Logika Bisnis untuk mengecek semua slot waktu yang sudah dibooking
 * untuk suatu fasilitas pada tanggal tertentu.
 * @param facilityId ID Fasilitas
 * @param date Tanggal dalam format 'YYYY-MM-DD'
 */
const checkAvailability = (facilityId, date) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        /*
         * Query ini mengambil semua slot waktu dari item reservasi
         * untuk fasilitas ini pada tanggal ini, YANG STATUSNYA BUKAN
         * 'REJECTED' atau 'CANCELED'.
         *
         * Kita menggunakan JOIN untuk memfilter berdasarkan status di tabel 'reservations'.
         */
        const query = `
      SELECT 
        ri.start_datetime, 
        ri.end_datetime
      FROM reservation_items ri
      JOIN reservations r ON ri.reservation_id = r.reservation_id
      JOIN reservation_statuses s ON r.status_id = s.status_id
      WHERE ri.facility_id = $1
        -- Pastikan hanya mengambil slot dari hari yang diminta
        AND DATE(ri.start_datetime) = $2
        -- Filter status yang masih aktif/pending
        AND s.name IN ('PENDING', 'APPROVED')
      ORDER BY ri.start_datetime ASC;
    `;
        // Catatan: Parameter $2 harus berupa string tanggal YYYY-MM-DD
        const result = yield index_1.pool.query(query, [facilityId, date]);
        return result.rows;
    }
    catch (err) {
        console.error(err);
        if (err instanceof Error) {
            throw new AppError_1.AppError('Gagal mengecek ketersediaan: ' + err.message, 500);
        }
        throw new AppError_1.AppError('Gagal mengecek ketersediaan.', 500);
    }
});
exports.checkAvailability = checkAvailability;
