/*
 * =======================================================
 * FILE: server/src/services/equipmentService.ts (FILE BARU)
 * LOKASI: server/src/services/equipmentService.ts
 * =======================================================
 */
import { pool } from '../index';
import { AppError } from '../utils/AppError';

// Tipe data untuk output peralatan
interface Equipment {
  equipment_id: number;
  type_id: number;
  name: string;
  location: string;
  quantity: number;
  description: string;
  photo_url: string | null;
  is_active: boolean;
  type_name?: string;
}

// Tipe data untuk input peralatan baru (untuk POST/PUT)
interface EquipmentInput {
  type_id: number;
  name: string;
  location: string;
  quantity: number;
  description: string;
  photo_url: string | null;
}

// ================================================
// --- FUNGSI GET (READ) ---
// ================================================

/**
 * Mengambil semua peralatan yang aktif
 */
export const getAllEquipment = async (): Promise<Equipment[]> => {
  try {
    const result = await pool.query(
      `SELECT 
         e.*, 
         ft.name as type_name 
       FROM equipments e
       JOIN facility_types ft ON e.type_id = ft.type_id
       WHERE e.is_active = true
       ORDER BY e.name ASC`
    );

    return result.rows;
  } catch (err: unknown) {
    console.error(err);
    throw new AppError('Gagal mengambil data peralatan.', 500);
  }
};

/**
 * Mengambil SATU peralatan berdasarkan ID
 */
export const getEquipmentById = async (id: number): Promise<Equipment> => {
  try {
    const result = await pool.query(
      `SELECT 
         e.*, 
         ft.name as type_name 
       FROM equipments e
       JOIN facility_types ft ON e.type_id = ft.type_id
       WHERE e.is_active = true AND e.equipment_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Peralatan tidak ditemukan atau tidak aktif', 404);
    }

    return result.rows[0];
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    console.error(err);
    throw new AppError('Gagal mengambil data peralatan dari database', 500);
  }
};

// ================================================
// --- FUNGSI CREATE ---
// ================================================
/**
 * Membuat peralatan baru (Khusus Admin)
 */
export const createEquipment = async (input: EquipmentInput): Promise<Equipment> => {
  try {
    const { type_id, name, location, quantity, description, photo_url } = input;

    // Periksa apakah type_id ada (agar tidak melanggar foreign key)
    const typeCheck = await pool.query('SELECT 1 FROM facility_types WHERE type_id = $1', [
      type_id,
    ]);
    if (typeCheck.rows.length === 0) {
      throw new AppError('ID Tipe Fasilitas tidak ditemukan.', 400);
    }

    const result = await pool.query(
      `INSERT INTO equipments (type_id, name, location, quantity, description, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [type_id, name, location, quantity, description, photo_url]
    );

    // Dapatkan type_name untuk dikembalikan
    const typeNameResult = await pool.query('SELECT name FROM facility_types WHERE type_id = $1', [
      type_id,
    ]);
    const type_name = typeNameResult.rows[0]?.name || 'Unknown';

    return {
      ...result.rows[0],
      type_name: type_name,
    };
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      throw new AppError('Nama peralatan sudah ada (duplikat).', 409);
    }

    if (err instanceof AppError) throw err;
    console.error(err);
    throw new AppError('Gagal membuat peralatan baru.', 500);
  }
};

// ================================================
// --- FUNGSI UPDATE ---
// ================================================
/**
 * Mengupdate (mengedit) peralatan
 */
export const updateEquipment = async (id: number, input: EquipmentInput): Promise<Equipment> => {
  try {
    const { type_id, name, location, quantity, description, photo_url } = input;

    // Periksa apakah type_id ada
    const typeCheck = await pool.query('SELECT 1 FROM facility_types WHERE type_id = $1', [
      type_id,
    ]);
    if (typeCheck.rows.length === 0) {
      throw new AppError('ID Tipe Fasilitas tidak ditemukan.', 400);
    }

    const result = await pool.query(
      `UPDATE equipments SET 
        type_id = $1, 
        name = $2, 
        location = $3, 
        quantity = $4,
        description = $5,
        photo_url = $6,
        updated_at = NOW()
       WHERE equipment_id = $7
       RETURNING *`,
      [type_id, name, location, quantity, description, photo_url, id]
    );

    if (result.rows.length === 0) {
      throw new AppError(`Peralatan dengan ID ${id} tidak ditemukan.`, 404);
    }

    // Dapatkan type_name untuk dikembalikan
    const typeNameResult = await pool.query('SELECT name FROM facility_types WHERE type_id = $1', [
      type_id,
    ]);
    const type_name = typeNameResult.rows[0]?.name || 'Unknown';

    return {
      ...result.rows[0],
      type_name: type_name,
    };
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      throw new AppError('Nama peralatan sudah ada (duplikat).', 409);
    }
    if (err instanceof AppError) throw err;
    console.error(err);
    throw new AppError('Gagal mengupdate peralatan.', 500);
  }
};

// ================================================
// --- FUNGSI DELETE ---
// ================================================
/**
 * Menghapus peralatan
 */
export const deleteEquipment = async (id: number): Promise<{ message: string }> => {
  try {
    // Cek apakah ada reservasi aktif atau terhubung
    const activeReservations = await pool.query(
      `SELECT 1 FROM reservation_items WHERE equipment_id = $1 LIMIT 1`,
      [id]
    );

    if (activeReservations.rows.length > 0) {
      throw new AppError(
        'Peralatan ini memiliki reservasi yang terhubung dan tidak dapat dihapus.',
        400
      );
    }

    // Hapus data
    const result = await pool.query(
      'DELETE FROM equipments WHERE equipment_id = $1 RETURNING equipment_id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError(`Peralatan dengan ID ${id} tidak ditemukan.`, 404);
    }

    return { message: `Peralatan ID ${id} berhasil dihapus.` };
  } catch (err: unknown) {
    if (err instanceof AppError) throw err;
    console.error(err);
    throw new AppError('Gagal menghapus peralatan.', 500);
  }
};
