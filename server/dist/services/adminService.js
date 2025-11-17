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
exports.updateReservationStatus = exports.getAllReservations = void 0;
/*
 * ===================================================
 * FILE: server/src/services/adminService.ts (UPDATE)
 * ===================================================
 */
const index_1 = require("../index");
const AppError_1 = require("../utils/AppError");
/**
 * Logika Bisnis untuk ADMIN mengambil SEMUA reservasi
 * dari SEMUA user.
 */
const getAllReservations = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        /*
         * Query ini mirip 'getMyReservations', TAPI:
         * 1. Tidak ada "WHERE r.requester_id = $1" (kita ambil semua).
         * 2. Kita tambahkan info 'full_name' dari user yang me-request.
         */
        const query = `
      SELECT 
        r.reservation_id, 
        r.purpose, 
        r.attendees, 
        r.created_at, 
        r.is_canceled,
        s.name as status_name,
        u.full_name as requester_name, -- (Info tambahan untuk Admin)
        u.email as requester_email,   -- (Info tambahan untuk Admin)
        
        -- Kumpulkan semua item yang terkait
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
      JOIN users u ON r.requester_id = u.user_id -- (Join tabel users)
      
      -- Urutkan yang PENDING dan paling baru muncul di atas
      ORDER BY 
        CASE s.name
          WHEN 'PENDING' THEN 1
          WHEN 'APPROVED' THEN 2
          WHEN 'REJECTED' THEN 3
          WHEN 'CANCELED' THEN 4
          WHEN 'COMPLETED' THEN 5
          ELSE 6
        END ASC,
        r.created_at DESC;
    `;
        const result = yield index_1.pool.query(query);
        return result.rows;
    }
    catch (err) {
        console.error(err);
        if (err instanceof Error) {
            throw new AppError_1.AppError('Gagal mengambil semua reservasi: ' + err.message, 500);
        }
        throw new AppError_1.AppError('Gagal mengambil semua reservasi.', 500);
    }
});
exports.getAllReservations = getAllReservations;
// ================================================
// --- FUNGSI BARU DIMULAI DI SINI ---
// ================================================
/**
 * Logika Bisnis untuk ADMIN mengubah status reservasi
 * @param reservationId ID reservasi yang akan diubah
 * @param newStatusNama Nama status baru (e.g., 'APPROVED', 'REJECTED')
 * @param adminId ID admin yang melakukan aksi (untuk logging)
 * @param comment Komentar dari admin (opsional)
 */
const updateReservationStatus = (reservationId, newStatusName, // Hanya boleh 3 ini
adminId, comment) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield index_1.pool.connect();
    try {
        // === MULAI TRANSAKSI ===
        yield client.query('BEGIN');
        // 1. Dapatkan 'status_id' baru dari namanya
        const statusResult = yield client.query('SELECT status_id FROM reservation_statuses WHERE name = $1', [newStatusName]);
        if (statusResult.rows.length === 0) {
            throw new AppError_1.AppError(`Status '${newStatusName}' tidak valid.`, 400);
        }
        const newStatusId = statusResult.rows[0].status_id;
        // 2. Update tabel 'reservations' dengan status_id baru
        const updateResult = yield client.query('UPDATE reservations SET status_id = $1 WHERE reservation_id = $2 RETURNING reservation_id', [newStatusId, reservationId]);
        if (updateResult.rows.length === 0) {
            throw new AppError_1.AppError(`Reservasi dengan ID ${reservationId} tidak ditemukan.`, 404);
        }
        // 3. Catat aksi ini di 'approval_logs' (sesuai SQL Anda)
        yield client.query(`INSERT INTO approval_logs (reservation_id, acted_by, "action", "comment")
       VALUES ($1, $2, $3, $4)`, 
        // 'newStatusName' harus di-cast ke tipe ENUM approval_action_enum
        [reservationId, adminId, newStatusName, comment]);
        // 4. TODO: Kirim Notifikasi ke User
        // (Ini bisa ditambahkan nanti. Kita perlu data 'requester_id')
        // === SELESAI! SIMPAN SEMUA PERUBAHAN ===
        yield client.query('COMMIT');
        return {
            message: `Reservasi #${reservationId} berhasil di-${newStatusName.toLowerCase()}`,
            newStatus: newStatusName
        };
    }
    catch (err) {
        // Jika error, batalkan semua
        yield client.query('ROLLBACK');
        if (err instanceof AppError_1.AppError)
            throw err;
        if (err instanceof Error) {
            throw new AppError_1.AppError('Gagal update status reservasi: ' + err.message, 500);
        }
        throw new AppError_1.AppError('Gagal update status reservasi.', 500);
    }
    finally {
        // Selalu kembalikan client ke pool
        client.release();
    }
});
exports.updateReservationStatus = updateReservationStatus;
