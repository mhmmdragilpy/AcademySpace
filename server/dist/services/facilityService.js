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
exports.deleteFacility = exports.updateFacility = exports.getAllFacilityTypes = exports.createFacility = exports.getById = exports.getAll = void 0;
/*
 * ===================================================
 * FILE: server/src/services/facilityService.ts (SINKRONISASI ULANG)
 * ===================================================
 */
const index_1 = require("../index");
const AppError_1 = require("../utils/AppError");
// ================================================
// --- FUNGSI GET & CREATE & GET ALL TYPES (Tidak Berubah) ---
// ================================================
const getAll = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield index_1.pool.query(`SELECT 
         f.*, 
         ft.name as type_name 
       FROM facilities f
       JOIN facility_types ft ON f.type_id = ft.type_id
       WHERE f.is_active = true
       ORDER BY f.name ASC`);
        return result.rows;
    }
    catch (err) {
        console.error(err);
        if (err instanceof Error) {
            throw new AppError_1.AppError('Gagal mengambil data fasilitas: ' + err.message, 500);
        }
        throw new AppError_1.AppError('Gagal mengambil data fasilitas.', 500);
    }
});
exports.getAll = getAll;
const getById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield index_1.pool.query(`SELECT 
         f.*, 
         ft.name as type_name 
       FROM facilities f
       JOIN facility_types ft ON f.type_id = ft.type_id
       WHERE f.is_active = true AND f.facility_id = $1`, [id]);
        if (result.rows.length === 0) {
            throw new AppError_1.AppError('Fasilitas tidak ditemukan atau tidak aktif', 404);
        }
        return result.rows[0];
    }
    catch (err) {
        if (err instanceof AppError_1.AppError) {
            throw err;
        }
        console.error(err);
        throw new AppError_1.AppError('Gagal mengambil data fasilitas dari database', 500);
    }
});
exports.getById = getById;
const createFacility = (input) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { type_id, name, location, capacity, layout_description, photo_url } = input;
        const typeCheck = yield index_1.pool.query('SELECT 1 FROM facility_types WHERE type_id = $1', [type_id]);
        if (typeCheck.rows.length === 0) {
            throw new AppError_1.AppError('ID Tipe Fasilitas tidak ditemukan.', 400);
        }
        const result = yield index_1.pool.query(`INSERT INTO facilities (type_id, name, location, capacity, layout_description, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [type_id, name, location, capacity, layout_description, photo_url]);
        const typeNameResult = yield index_1.pool.query('SELECT name FROM facility_types WHERE type_id = $1', [type_id]);
        const type_name = ((_a = typeNameResult.rows[0]) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown';
        return Object.assign(Object.assign({}, result.rows[0]), { type_name: type_name });
    }
    catch (err) {
        if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
            throw new AppError_1.AppError('Nama fasilitas sudah ada. Gunakan nama yang berbeda.', 409);
        }
        if (err instanceof AppError_1.AppError)
            throw err;
        console.error(err);
        throw new AppError_1.AppError('Gagal membuat fasilitas baru.', 500);
    }
});
exports.createFacility = createFacility;
const getAllFacilityTypes = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield index_1.pool.query(`SELECT type_id, name, description FROM facility_types ORDER BY name ASC`);
        return result.rows;
    }
    catch (err) {
        console.error(err);
        throw new AppError_1.AppError('Gagal mengambil daftar tipe fasilitas.', 500);
    }
});
exports.getAllFacilityTypes = getAllFacilityTypes;
// ================================================
// --- FUNGSI UPDATE DAN DELETE (YANG BARU) ---
// ================================================
/**
 * Logika Bisnis untuk mengupdate (mengedit) fasilitas
 */
const updateFacility = (id, input) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { type_id, name, location, capacity, layout_description, photo_url } = input;
        // Periksa apakah type_id ada
        const typeCheck = yield index_1.pool.query('SELECT 1 FROM facility_types WHERE type_id = $1', [type_id]);
        if (typeCheck.rows.length === 0) {
            throw new AppError_1.AppError('ID Tipe Fasilitas tidak ditemukan.', 400);
        }
        // Update data ke tabel facilities
        const result = yield index_1.pool.query(`UPDATE facilities SET 
        type_id = $1, 
        name = $2, 
        location = $3, 
        capacity = $4, 
        layout_description = $5, 
        photo_url = $6,
        updated_at = NOW() -- Gunakan trigger jika ada, atau set manual
       WHERE facility_id = $7
       RETURNING *`, [type_id, name, location, capacity, layout_description, photo_url, id]);
        if (result.rows.length === 0) {
            throw new AppError_1.AppError(`Fasilitas dengan ID ${id} tidak ditemukan.`, 404);
        }
        // Dapatkan type_name untuk dikembalikan
        const typeNameResult = yield index_1.pool.query('SELECT name FROM facility_types WHERE type_id = $1', [type_id]);
        const type_name = ((_a = typeNameResult.rows[0]) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown';
        return Object.assign(Object.assign({}, result.rows[0]), { type_name: type_name });
    }
    catch (err) {
        if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
            throw new AppError_1.AppError('Nama fasilitas sudah ada (duplikat).', 409);
        }
        if (err instanceof AppError_1.AppError)
            throw err;
        console.error(err);
        throw new AppError_1.AppError('Gagal mengupdate fasilitas.', 500);
    }
});
exports.updateFacility = updateFacility;
/**
 * Logika Bisnis untuk menghapus fasilitas
 */
const deleteFacility = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Cek apakah ada reservasi aktif atau terhubung
        // (Jika ada, DB akan melempar Foreign Key Error, tapi kita buat pesan yang lebih baik)
        const activeReservations = yield index_1.pool.query(`SELECT 1 FROM reservation_items WHERE facility_id = $1 LIMIT 1`, [id]);
        if (activeReservations.rows.length > 0) {
            throw new AppError_1.AppError('Fasilitas ini memiliki reservasi yang terhubung dan tidak dapat dihapus.', 400);
        }
        // Hapus data
        const result = yield index_1.pool.query('DELETE FROM facilities WHERE facility_id = $1 RETURNING facility_id', [id]);
        if (result.rows.length === 0) {
            throw new AppError_1.AppError(`Fasilitas dengan ID ${id} tidak ditemukan.`, 404);
        }
        return { message: `Fasilitas ID ${id} berhasil dihapus.` };
    }
    catch (err) {
        if (err instanceof AppError_1.AppError)
            throw err;
        console.error(err);
        throw new AppError_1.AppError('Gagal menghapus fasilitas.', 500);
    }
});
exports.deleteFacility = deleteFacility;
