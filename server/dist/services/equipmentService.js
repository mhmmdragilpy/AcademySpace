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
exports.deleteEquipment = exports.updateEquipment = exports.createEquipment = exports.getEquipmentById = exports.getAllEquipment = void 0;
/*
 * =======================================================
 * FILE: server/src/services/equipmentService.ts (FILE BARU)
 * LOKASI: server/src/services/equipmentService.ts
 * =======================================================
 */
const index_1 = require("../index");
const AppError_1 = require("../utils/AppError");
// ================================================
// --- FUNGSI GET (READ) ---
// ================================================
/**
 * Mengambil semua peralatan yang aktif
 */
const getAllEquipment = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield index_1.pool.query(`SELECT 
         e.*, 
         ft.name as type_name 
       FROM equipments e
       JOIN facility_types ft ON e.type_id = ft.type_id
       WHERE e.is_active = true
       ORDER BY e.name ASC`);
        return result.rows;
    }
    catch (err) {
        console.error(err);
        throw new AppError_1.AppError('Gagal mengambil data peralatan.', 500);
    }
});
exports.getAllEquipment = getAllEquipment;
/**
 * Mengambil SATU peralatan berdasarkan ID
 */
const getEquipmentById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield index_1.pool.query(`SELECT 
         e.*, 
         ft.name as type_name 
       FROM equipments e
       JOIN facility_types ft ON e.type_id = ft.type_id
       WHERE e.is_active = true AND e.equipment_id = $1`, [id]);
        if (result.rows.length === 0) {
            throw new AppError_1.AppError('Peralatan tidak ditemukan atau tidak aktif', 404);
        }
        return result.rows[0];
    }
    catch (err) {
        if (err instanceof AppError_1.AppError) {
            throw err;
        }
        console.error(err);
        throw new AppError_1.AppError('Gagal mengambil data peralatan dari database', 500);
    }
});
exports.getEquipmentById = getEquipmentById;
// ================================================
// --- FUNGSI CREATE ---
// ================================================
/**
 * Membuat peralatan baru (Khusus Admin)
 */
const createEquipment = (input) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { type_id, name, location, quantity, description, photo_url } = input;
        // Periksa apakah type_id ada (agar tidak melanggar foreign key)
        const typeCheck = yield index_1.pool.query('SELECT 1 FROM facility_types WHERE type_id = $1', [type_id]);
        if (typeCheck.rows.length === 0) {
            throw new AppError_1.AppError('ID Tipe Fasilitas tidak ditemukan.', 400);
        }
        const result = yield index_1.pool.query(`INSERT INTO equipments (type_id, name, location, quantity, description, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [type_id, name, location, quantity, description, photo_url]);
        // Dapatkan type_name untuk dikembalikan
        const typeNameResult = yield index_1.pool.query('SELECT name FROM facility_types WHERE type_id = $1', [type_id]);
        const type_name = ((_a = typeNameResult.rows[0]) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown';
        return Object.assign(Object.assign({}, result.rows[0]), { type_name: type_name });
    }
    catch (err) {
        if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
            throw new AppError_1.AppError('Nama peralatan sudah ada (duplikat).', 409);
        }
        if (err instanceof AppError_1.AppError)
            throw err;
        console.error(err);
        throw new AppError_1.AppError('Gagal membuat peralatan baru.', 500);
    }
});
exports.createEquipment = createEquipment;
// ================================================
// --- FUNGSI UPDATE ---
// ================================================
/**
 * Mengupdate (mengedit) peralatan
 */
const updateEquipment = (id, input) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { type_id, name, location, quantity, description, photo_url } = input;
        // Periksa apakah type_id ada
        const typeCheck = yield index_1.pool.query('SELECT 1 FROM facility_types WHERE type_id = $1', [type_id]);
        if (typeCheck.rows.length === 0) {
            throw new AppError_1.AppError('ID Tipe Fasilitas tidak ditemukan.', 400);
        }
        const result = yield index_1.pool.query(`UPDATE equipments SET 
        type_id = $1, 
        name = $2, 
        location = $3, 
        quantity = $4,
        description = $5,
        photo_url = $6,
        updated_at = NOW()
       WHERE equipment_id = $7
       RETURNING *`, [type_id, name, location, quantity, description, photo_url, id]);
        if (result.rows.length === 0) {
            throw new AppError_1.AppError(`Peralatan dengan ID ${id} tidak ditemukan.`, 404);
        }
        // Dapatkan type_name untuk dikembalikan
        const typeNameResult = yield index_1.pool.query('SELECT name FROM facility_types WHERE type_id = $1', [type_id]);
        const type_name = ((_a = typeNameResult.rows[0]) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown';
        return Object.assign(Object.assign({}, result.rows[0]), { type_name: type_name });
    }
    catch (err) {
        if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
            throw new AppError_1.AppError('Nama peralatan sudah ada (duplikat).', 409);
        }
        if (err instanceof AppError_1.AppError)
            throw err;
        console.error(err);
        throw new AppError_1.AppError('Gagal mengupdate peralatan.', 500);
    }
});
exports.updateEquipment = updateEquipment;
// ================================================
// --- FUNGSI DELETE ---
// ================================================
/**
 * Menghapus peralatan
 */
const deleteEquipment = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Cek apakah ada reservasi aktif atau terhubung
        const activeReservations = yield index_1.pool.query(`SELECT 1 FROM reservation_items WHERE equipment_id = $1 LIMIT 1`, [id]);
        if (activeReservations.rows.length > 0) {
            throw new AppError_1.AppError('Peralatan ini memiliki reservasi yang terhubung dan tidak dapat dihapus.', 400);
        }
        // Hapus data
        const result = yield index_1.pool.query('DELETE FROM equipments WHERE equipment_id = $1 RETURNING equipment_id', [id]);
        if (result.rows.length === 0) {
            throw new AppError_1.AppError(`Peralatan dengan ID ${id} tidak ditemukan.`, 404);
        }
        return { message: `Peralatan ID ${id} berhasil dihapus.` };
    }
    catch (err) {
        if (err instanceof AppError_1.AppError)
            throw err;
        console.error(err);
        throw new AppError_1.AppError('Gagal menghapus peralatan.', 500);
    }
});
exports.deleteEquipment = deleteEquipment;
