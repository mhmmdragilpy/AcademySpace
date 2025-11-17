"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.deleteEquipmentController = exports.updateEquipmentController = exports.createEquipmentController = exports.getEquipmentByIdController = exports.getAllEquipmentController = void 0;
// Impor 'otak' kita
const equipmentService = __importStar(require("../services/equipmentService"));
// Impor error kustom kita
const AppError_1 = require("../utils/AppError");
// ================================================
// --- FUNGSI GET ALL ---
// ================================================
/**
 * @route   GET /api/equipment
 * @desc    Mengambil semua peralatan yang aktif
 * @access  Private (membutuhkan login)
 */
const getAllEquipmentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const equipment = yield equipmentService.getAllEquipment();
        return res.status(200).json(equipment);
    }
    catch (err) {
        if (err instanceof AppError_1.AppError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        return res.status(500).send('Server error saat mengambil daftar peralatan.');
    }
});
exports.getAllEquipmentController = getAllEquipmentController;
// ================================================
// --- FUNGSI GET BY ID ---
// ================================================
/**
 * @route   GET /api/equipment/:id
 * @desc    Mengambil detail satu peralatan
 * @access  Private (membutuhkan login)
 */
const getEquipmentByIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID peralatan tidak valid' });
        }
        const equipment = yield equipmentService.getEquipmentById(id);
        return res.status(200).json(equipment);
    }
    catch (err) {
        if (err instanceof AppError_1.AppError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        return res.status(500).send('Server error saat mengambil detail peralatan.');
    }
});
exports.getEquipmentByIdController = getEquipmentByIdController;
// ================================================
// --- FUNGSI CREATE ---
// ================================================
/**
 * @route   POST /api/equipment (Admin)
 * @desc    Membuat peralatan baru
 * @access  Admin
 */
const createEquipmentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type_id, name, location, quantity, description, photo_url } = req.body;
        // Validasi dasar
        if (!type_id || !name || !quantity) {
            return res.status(400).json({
                message: 'Data tidak lengkap. Harus menyertakan type_id, name, dan quantity.'
            });
        }
        const newEquipment = yield equipmentService.createEquipment({
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
    }
    catch (err) {
        if (err instanceof AppError_1.AppError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        return res.status(500).send('Server error saat membuat peralatan.');
    }
});
exports.createEquipmentController = createEquipmentController;
// ================================================
// --- FUNGSI UPDATE ---
// ================================================
/**
 * @route   PUT /api/equipment/:id (Admin)
 * @desc    Mengupdate detail peralatan
 * @access  Admin
 */
const updateEquipmentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const equipmentId = parseInt(id, 10);
        const { type_id, name, location, quantity, description, photo_url } = req.body;
        if (isNaN(equipmentId) || !type_id || !name || !quantity) {
            return res.status(400).json({ message: 'Data tidak lengkap atau ID peralatan tidak valid.' });
        }
        const updatedEquipment = yield equipmentService.updateEquipment(equipmentId, {
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
    }
    catch (err) {
        if (err instanceof AppError_1.AppError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        return res.status(500).send('Server error saat mengupdate peralatan.');
    }
});
exports.updateEquipmentController = updateEquipmentController;
// ================================================
// --- FUNGSI DELETE ---
// ================================================
/**
 * @route   DELETE /api/equipment/:id (Admin)
 * @desc    Menghapus peralatan
 * @access  Admin
 */
const deleteEquipmentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const equipmentId = parseInt(id, 10);
        if (isNaN(equipmentId)) {
            return res.status(400).json({ message: 'ID peralatan tidak valid.' });
        }
        const result = yield equipmentService.deleteEquipment(equipmentId);
        return res.status(200).json(result);
    }
    catch (err) {
        if (err instanceof AppError_1.AppError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        return res.status(500).send('Server error saat menghapus peralatan.');
    }
});
exports.deleteEquipmentController = deleteEquipmentController;
