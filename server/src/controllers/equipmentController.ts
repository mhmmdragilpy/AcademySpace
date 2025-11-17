/*
 * =======================================================
 * FILE: server/src/controllers/equipmentController.ts (FILE BARU)
 * LOKASI: server/src/controllers/equipmentController.ts
 * =======================================================
 */
import { Request, Response } from 'express';
// Impor 'otak' kita
import * as equipmentService from '../services/equipmentService';
// Impor error kustom kita
import { AppError } from '../utils/AppError';

// ================================================
// --- FUNGSI GET ALL ---
// ================================================
/**
 * @route   GET /api/equipment
 * @desc    Mengambil semua peralatan yang aktif
 * @access  Private (membutuhkan login)
 */
export const getAllEquipmentController = async (req: Request, res: Response) => {
  try {
    const equipment = await equipmentService.getAllEquipment();
    return res.status(200).json(equipment);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).send('Server error saat mengambil daftar peralatan.');
  }
};

// ================================================
// --- FUNGSI GET BY ID ---
// ================================================
/**
 * @route   GET /api/equipment/:id
 * @desc    Mengambil detail satu peralatan
 * @access  Private (membutuhkan login)
 */
export const getEquipmentByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID peralatan tidak valid' });
    }
    const equipment = await equipmentService.getEquipmentById(id);
    return res.status(200).json(equipment);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).send('Server error saat mengambil detail peralatan.');
  }
};

// ================================================
// --- FUNGSI CREATE ---
// ================================================
/**
 * @route   POST /api/equipment (Admin)
 * @desc    Membuat peralatan baru
 * @access  Admin
 */
export const createEquipmentController = async (req: Request, res: Response) => {
  try {
    const { type_id, name, location, quantity, description, photo_url } = req.body;

    // Validasi dasar
    if (!type_id || !name || !quantity) {
      return res.status(400).json({
        message: 'Data tidak lengkap. Harus menyertakan type_id, name, dan quantity.',
      });
    }

    const newEquipment = await equipmentService.createEquipment({
      type_id: parseInt(type_id, 10),
      name,
      location: location || null,
      quantity: parseInt(quantity, 10),
      description: description || null,
      photo_url: photo_url || null,
    });

    return res.status(201).json({
      message: 'Peralatan berhasil dibuat.',
      equipment: newEquipment,
    });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).send('Server error saat membuat peralatan.');
  }
};

// ================================================
// --- FUNGSI UPDATE ---
// ================================================
/**
 * @route   PUT /api/equipment/:id (Admin)
 * @desc    Mengupdate detail peralatan
 * @access  Admin
 */
export const updateEquipmentController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const equipmentId = parseInt(id, 10);
    const { type_id, name, location, quantity, description, photo_url } = req.body;

    if (isNaN(equipmentId) || !type_id || !name || !quantity) {
      return res.status(400).json({ message: 'Data tidak lengkap atau ID peralatan tidak valid.' });
    }

    const updatedEquipment = await equipmentService.updateEquipment(equipmentId, {
      type_id: parseInt(type_id, 10),
      name,
      location: location || null,
      quantity: parseInt(quantity, 10),
      description: description || null,
      photo_url: photo_url || null,
    });

    return res.status(200).json({
      message: 'Peralatan berhasil diperbarui.',
      equipment: updatedEquipment,
    });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).send('Server error saat mengupdate peralatan.');
  }
};

// ================================================
// --- FUNGSI DELETE ---
// ================================================
/**
 * @route   DELETE /api/equipment/:id (Admin)
 * @desc    Menghapus peralatan
 * @access  Admin
 */
export const deleteEquipmentController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const equipmentId = parseInt(id, 10);

    if (isNaN(equipmentId)) {
      return res.status(400).json({ message: 'ID peralatan tidak valid.' });
    }

    const result = await equipmentService.deleteEquipment(equipmentId);

    return res.status(200).json(result);
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).send('Server error saat menghapus peralatan.');
  }
};
