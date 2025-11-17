/*
 * ===================================================
 * FILE: server/src/services/facilityService.ts (UPDATE: TYPE CRUD)
 * ===================================================
 */
import { pool } from '../index';
import { AppError } from '../utils/AppError';

// Tipe data fasilitas (untuk GET)
interface Facility {
  facility_id: number;
  type_id: number;
  name: string;
  location: string;
  capacity: number;
  photo_url: string;
  is_active: boolean;
  type_name?: string;
}

// Tipe data untuk input fasilitas baru (untuk POST/PUT)
interface FacilityInput {
  type_id: number;
  name: string;
  location: string;
  capacity: number;
  layout_description: string | null;
  photo_url: string | null;
}

// TIPE DATA untuk FacilityType (Data Master)
interface FacilityType {
  type_id: number;
  name: string;
  description: string;
}

// Tipe data input untuk Tipe Fasilitas
interface FacilityTypeInput {
  name: string;
  description: string;
}

// ================================================
// --- FUNGSI GET ALL, GET BY ID, CREATE, UPDATE, DELETE (FASILITAS) ---
// (Ini adalah fungsi-fungsi yang sudah ada dan tidak berubah)
// ================================================
export const getAll = async (): Promise<Facility[]> => {
  /* ... (kode getAll) ... */
  try {
    const result = await pool.query(
      `SELECT 
         f.*, 
         ft.name as type_name 
       FROM facilities f
       JOIN facility_types ft ON f.type_id = ft.type_id
       WHERE f.is_active = true
       ORDER BY f.name ASC`
    );
    return result.rows;
  } catch (err: unknown) {
    console.error(err);
    if (err instanceof Error) {
      throw new AppError('Gagal mengambil data fasilitas: ' + err.message, 500);
    }
    throw new AppError('Gagal mengambil data fasilitas.', 500);
  }
};

export const getById = async (id: number): Promise<Facility> => {
  /* ... (kode getById) ... */
  try {
    const result = await pool.query(
      `SELECT 
         f.*, 
         ft.name as type_name 
       FROM facilities f
       JOIN facility_types ft ON f.type_id = ft.type_id
       WHERE f.is_active = true AND f.facility_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Fasilitas tidak ditemukan atau tidak aktif', 404);
    }
    return result.rows[0];
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    console.error(err);
    throw new AppError('Gagal mengambil data fasilitas dari database', 500);
  }
};

export const createFacility = async (input: FacilityInput): Promise<Facility> => {
  /* ... (kode createFacility) ... */
  try {
    const { type_id, name, location, capacity, layout_description, photo_url } = input;

    // Periksa apakah type_id ada (agar tidak melanggar foreign key)
    const typeCheck = await pool.query('SELECT 1 FROM facility_types WHERE type_id = $1', [
      type_id,
    ]);
    if (typeCheck.rows.length === 0) {
      throw new AppError('ID Tipe Fasilitas tidak ditemukan.', 400);
    }

    const result = await pool.query(
      `INSERT INTO facilities (type_id, name, location, capacity, layout_description, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [type_id, name, location, capacity, layout_description, photo_url]
    );

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
      throw new AppError('Nama fasilitas sudah ada. Gunakan nama yang berbeda.', 409);
    }

    if (err instanceof AppError) throw err;
    console.error(err);
    throw new AppError('Gagal membuat fasilitas baru.', 500);
  }
};

export const updateFacility = async (id: number, input: FacilityInput): Promise<Facility> => {
  /* ... (kode updateFacility) ... */
  try {
    const { type_id, name, location, capacity, layout_description, photo_url } = input;

    // Periksa apakah type_id ada
    const typeCheck = await pool.query('SELECT 1 FROM facility_types WHERE type_id = $1', [
      type_id,
    ]);
    if (typeCheck.rows.length === 0) {
      throw new AppError('ID Tipe Fasilitas tidak ditemukan.', 400);
    }

    const result = await pool.query(
      `UPDATE facilities SET 
        type_id = $1, 
        name = $2, 
        location = $3, 
        capacity = $4, 
        layout_description = $5, 
        photo_url = $6,
        updated_at = NOW()
       WHERE facility_id = $7
       RETURNING *`,
      [type_id, name, location, capacity, layout_description, photo_url, id]
    );

    if (result.rows.length === 0) {
      throw new AppError(`Fasilitas dengan ID ${id} tidak ditemukan.`, 404);
    }

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
      throw new AppError('Nama fasilitas sudah ada (duplikat).', 409);
    }
    if (err instanceof AppError) throw err;
    console.error(err);
    throw new AppError('Gagal mengupdate fasilitas.', 500);
  }
};

export const deleteFacility = async (id: number): Promise<{ message: string }> => {
  /* ... (kode deleteFacility) ... */
  try {
    // Cek apakah ada reservasi aktif atau terhubung
    const activeReservations = await pool.query(
      `SELECT 1 FROM reservation_items WHERE facility_id = $1 LIMIT 1`,
      [id]
    );

    if (activeReservations.rows.length > 0) {
      throw new AppError(
        'Fasilitas ini memiliki reservasi yang terhubung dan tidak dapat dihapus.',
        400
      );
    }

    // Hapus data
    const result = await pool.query(
      'DELETE FROM facilities WHERE facility_id = $1 RETURNING facility_id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError(`Fasilitas dengan ID ${id} tidak ditemukan.`, 404);
    }

    return { message: `Fasilitas ID ${id} berhasil dihapus.` };
  } catch (err: unknown) {
    if (err instanceof AppError) throw err;
    console.error(err);
    throw new AppError('Gagal menghapus fasilitas.', 500);
  }
};

// ================================================
// FUNGSI GET ALL TYPES (Tidak Berubah)
// ================================================
export const getAllFacilityTypes = async (): Promise<FacilityType[]> => {
  /* ... (kode getAllFacilityTypes) ... */
  try {
    const result = await pool.query(
      `SELECT type_id, name, description FROM facility_types ORDER BY name ASC`
    );
    return result.rows;
  } catch (err: unknown) {
    console.error(err);
    throw new AppError('Gagal mengambil daftar tipe fasilitas.', 500);
  }
};

// ================================================
// --- FUNGSI BARU DIMULAI DI SINI (TYPE CRUD) ---
// ================================================

/**
 * Logika Bisnis untuk membuat tipe fasilitas baru
 */
export const createFacilityType = async (input: FacilityTypeInput): Promise<FacilityType> => {
  try {
    const { name, description } = input;

    // Insert data ke tabel facility_types
    const result = await pool.query(
      `INSERT INTO facility_types (name, description)
       VALUES ($1, $2)
       RETURNING *`,
      [name, description]
    );

    return result.rows[0];
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      throw new AppError('Nama tipe fasilitas sudah ada.', 409);
    }
    if (err instanceof AppError) throw err;
    console.error(err);
    throw new AppError('Gagal membuat tipe fasilitas baru.', 500);
  }
};

/**
 * Logika Bisnis untuk mengupdate tipe fasilitas
 */
export const updateFacilityType = async (
  id: number,
  input: FacilityTypeInput
): Promise<FacilityType> => {
  try {
    const { name, description } = input;

    // Update data ke tabel facility_types
    const result = await pool.query(
      `UPDATE facility_types SET 
        name = $1, 
        description = $2
       WHERE type_id = $3
       RETURNING *`,
      [name, description, id]
    );

    if (result.rows.length === 0) {
      throw new AppError(`Tipe Fasilitas dengan ID ${id} tidak ditemukan.`, 404);
    }

    return result.rows[0];
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      throw new AppError('Nama tipe fasilitas sudah ada (duplikat).', 409);
    }
    if (err instanceof AppError) throw err;
    console.error(err);
    throw new AppError('Gagal mengupdate tipe fasilitas.', 500);
  }
};

/**
 * Logika Bisnis untuk menghapus tipe fasilitas
 */
export const deleteFacilityType = async (id: number): Promise<{ message: string }> => {
  try {
    // Cek apakah ada Fasilitas atau Peralatan yang masih menggunakan tipe ini
    const activeAssets = await pool.query(
      `SELECT 
         (SELECT COUNT(*) FROM facilities WHERE type_id = $1) AS facility_count,
         (SELECT COUNT(*) FROM equipments WHERE type_id = $1) AS equipment_count;
      `,
      [id]
    );

    const counts = activeAssets.rows[0];

    if (parseInt(counts.facility_count) > 0 || parseInt(counts.equipment_count) > 0) {
      throw new AppError(
        'Tipe fasilitas ini masih digunakan oleh fasilitas atau peralatan lain dan tidak dapat dihapus.',
        400
      );
    }

    // Hapus data
    const result = await pool.query(
      'DELETE FROM facility_types WHERE type_id = $1 RETURNING type_id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError(`Tipe Fasilitas dengan ID ${id} tidak ditemukan.`, 404);
    }

    return { message: `Tipe Fasilitas ID ${id} berhasil dihapus.` };
  } catch (err: unknown) {
    if (err instanceof AppError) throw err;
    console.error(err);
    throw new AppError('Gagal menghapus tipe fasilitas.', 500);
  }
};
