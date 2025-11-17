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
exports.deleteFacilityController = exports.updateFacilityController = exports.getAllFacilityTypesController = exports.createFacilityController = exports.getFacilityById = exports.getAllFacilities = void 0;
// Impor KEDUA fungsi dari service
const facilityService = __importStar(require("../services/facilityService"));
const AppError_1 = require("../utils/AppError");
// --- FUNGSI GET (Tidak Berubah) ---
const getAllFacilities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const facilities = yield facilityService.getAll();
        return res.status(200).json(facilities);
    }
    catch (err) {
        if (err instanceof AppError_1.AppError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        return res.status(500).send('Server error');
    }
});
exports.getAllFacilities = getAllFacilities;
const getFacilityById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID fasilitas tidak valid' });
        }
        const facility = yield facilityService.getById(id);
        return res.status(200).json(facility);
    }
    catch (err) {
        if (err instanceof AppError_1.AppError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        return res.status(500).send('Server error');
    }
});
exports.getFacilityById = getFacilityById;
// --- FUNGSI CREATE (Tidak Berubah) ---
const createFacilityController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type_id, name, location, capacity, layout_description, photo_url } = req.body;
        if (!type_id || !name || !location || !capacity) {
            return res.status(400).json({
                message: 'Data tidak lengkap. Harus menyertakan type_id, name, location, dan capacity.'
            });
        }
        const newFacility = yield facilityService.createFacility({
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
    }
    catch (err) {
        if (err instanceof AppError_1.AppError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        return res.status(500).send('Server error saat membuat fasilitas.');
    }
});
exports.createFacilityController = createFacilityController;
// --- FUNGSI GET TIPE FASILITAS (Tidak Berubah) ---
const getAllFacilityTypesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const types = yield facilityService.getAllFacilityTypes();
        return res.status(200).json(types);
    }
    catch (err) {
        if (err instanceof AppError_1.AppError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        return res.status(500).send('Server error saat mengambil tipe fasilitas.');
    }
});
exports.getAllFacilityTypesController = getAllFacilityTypesController;
// ================================================
// --- FUNGSI BARU DIMULAI DI SINI (UPDATE/DELETE) ---
// ================================================
/**
 * @route   PUT /api/facilities/:id (Admin)
 * @desc    Mengupdate detail fasilitas
 * @access  Admin
 */
const updateFacilityController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const facilityId = parseInt(id, 10);
        const { type_id, name, location, capacity, layout_description, photo_url } = req.body;
        if (isNaN(facilityId) || !type_id || !name || !location || !capacity) {
            return res.status(400).json({ message: 'Data tidak lengkap atau ID fasilitas tidak valid.' });
        }
        const updatedFacility = yield facilityService.updateFacility(facilityId, {
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
    }
    catch (err) {
        if (err instanceof AppError_1.AppError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        return res.status(500).send('Server error saat mengupdate fasilitas.');
    }
});
exports.updateFacilityController = updateFacilityController;
/**
 * @route   DELETE /api/facilities/:id (Admin)
 * @desc    Menghapus fasilitas
 * @access  Admin
 */
const deleteFacilityController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const facilityId = parseInt(id, 10);
        if (isNaN(facilityId)) {
            return res.status(400).json({ message: 'ID fasilitas tidak valid.' });
        }
        const result = yield facilityService.deleteFacility(facilityId);
        return res.status(200).json(result);
    }
    catch (err) {
        if (err instanceof AppError_1.AppError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        return res.status(500).send('Server error saat menghapus fasilitas.');
    }
});
exports.deleteFacilityController = deleteFacilityController;
