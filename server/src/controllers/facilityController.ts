/*
 * ==================================================
 * FILE: server/src/controllers/facilityController.ts (UPDATE: CRUD Tipe)
 * ==================================================
 */
import { Request, Response } from 'express';
// Impor KEDUA fungsi dari service
import * as facilityService from '../services/facilityService';
import { AppError } from '../utils/AppError';

// --- FUNGSI GET ALL, GET BY ID, CREATE, UPDATE, DELETE (FASILITAS) ---
// (Tidak Berubah)
export const getAllFacilities = async (req: Request, res: Response) => {
  try {
    const facilities = await facilityService.getAll();
    return res.status(200).json(facilities);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).send('Server error');
  }
};

export const getFacilityById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID fasilitas tidak valid' });
    }
    const facility = await facilityService.getById(id);
    return res.status(200).json(facility);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).send('Server error');
  }
};

export const createFacilityController = async (req: Request, res: Response) => {
  try {
    const { type_id, name, location, capacity, layout_description, photo_url } = req.body;

    if (!type_id || !name || !location || !capacity) {
      return res.status(400).json({
        message: 'Data tidak lengkap. Harus menyertakan type_id, name, location, dan capacity.',
      });
    }

    const newFacility = await facilityService.createFacility({
      type_id: parseInt(type_id, 10),
      name,
      location,
      capacity: parseInt(capacity, 10),
      layout_description: layout_description || null,
      photo_url: photo_url || null,
    });

    return res.status(201).json({
      message: 'Fasilitas berhasil dibuat.',
      facility: newFacility,
    });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).send('Server error saat membuat fasilitas.');
  }
};

export const updateFacilityController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const facilityId = parseInt(id, 10);
    const { type_id, name, location, capacity, layout_description, photo_url } = req.body;

    if (isNaN(facilityId) || !type_id || !name || !location || !capacity) {
      return res.status(400).json({ message: 'Data tidak lengkap atau ID fasilitas tidak valid.' });
    }

    const updatedFacility = await facilityService.updateFacility(facilityId, {
      type_id: parseInt(type_id, 10),
      name,
      location,
      capacity: parseInt(capacity, 10),
      layout_description: layout_description || null,
      photo_url: photo_url || null,
    });

    return res.status(200).json({
      message: 'Fasilitas berhasil diperbarui.',
      facility: updatedFacility,
    });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).send('Server error saat mengupdate fasilitas.');
  }
};

export const deleteFacilityController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const facilityId = parseInt(id, 10);

    if (isNaN(facilityId)) {
      return res.status(400).json({ message: 'ID fasilitas tidak valid.' });
    }

    const result = await facilityService.deleteFacility(facilityId);

    return res.status(200).json(result);
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).send('Server error saat menghapus fasilitas.');
  }
};

// --- FUNGSI GET ALL TYPES (Tidak Berubah) ---
export const getAllFacilityTypesController = async (req: Request, res: Response) => {
  try {
    const types = await facilityService.getAllFacilityTypes();
    return res.status(200).json(types);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).send('Server error saat mengambil tipe fasilitas.');
  }
};

// ================================================
// --- FUNGSI BARU DIMULAI DI SINI (TYPE CRUD) ---
// ================================================

/**
 * @route   POST /api/facilities/types (Admin)
 * @desc    Membuat tipe fasilitas baru
 * @access  Admin
 */
export const createFacilityTypeController = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Nama tipe fasilitas harus diisi.' });
    }

    const newType = await facilityService.createFacilityType({
      name,
      description: description || '',
    });

    return res.status(201).json({
      message: 'Tipe fasilitas berhasil dibuat.',
      type: newType,
    });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).send('Server error saat membuat tipe fasilitas.');
  }
};

/**
 * @route   PUT /api/facilities/types/:id (Admin)
 * @desc    Mengupdate tipe fasilitas
 * @access  Admin
 */
export const updateFacilityTypeController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const typeId = parseInt(id, 10);
    const { name, description } = req.body;

    if (isNaN(typeId) || !name) {
      return res.status(400).json({ message: 'Nama atau ID tipe fasilitas tidak valid.' });
    }

    const updatedType = await facilityService.updateFacilityType(typeId, {
      name,
      description: description || '',
    });

    return res.status(200).json({
      message: 'Tipe fasilitas berhasil diperbarui.',
      type: updatedType,
    });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).send('Server error saat mengupdate tipe fasilitas.');
  }
};

/**
 * @route   DELETE /api/facilities/types/:id (Admin)
 * @desc    Menghapus tipe fasilitas
 * @access  Admin
 */
export const deleteFacilityTypeController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const typeId = parseInt(id, 10);

    if (isNaN(typeId)) {
      return res.status(400).json({ message: 'ID tipe fasilitas tidak valid.' });
    }

    const result = await facilityService.deleteFacilityType(typeId);

    return res.status(200).json(result);
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).send('Server error saat menghapus tipe fasilitas.');
  }
};
