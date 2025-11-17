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
exports.updateReservationStatusController = exports.getAllReservationsController = void 0;
// Impor "Otak" Admin
const adminService = __importStar(require("../services/adminService"));
// Impor error kustom kita
const AppError_1 = require("../utils/AppError");
/**
 * @route   GET /api/admin/reservations/all
 * @desc    (Admin) Mengambil SEMUA reservasi dari semua user
 * @access  Admin
 */
const getAllReservationsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Panggil "Otak" (Service) untuk mengambil data
        const allReservations = yield adminService.getAllReservations();
        // 2. Kirim data
        return res.status(200).json(allReservations);
    }
    catch (err) { // <-- Penanganan error yang aman
        // 3. Tangani error yang dilempar oleh Service
        if (err instanceof AppError_1.AppError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        if (err instanceof Error) {
            console.error(err.message);
            return res.status(500).send('Server error saat mengambil semua reservasi');
        }
        console.error(err);
        return res.status(500).send('Server error (unknown) saat mengambil data');
    }
});
exports.getAllReservationsController = getAllReservationsController;
// ================================================
// --- FUNGSI BARU DIMULAI DI SINI ---
// ================================================
/**
 * @route   PUT /api/admin/reservations/status/:id
 * @desc    (Admin) Mengubah status reservasi (Approve/Reject)
 * @access  Admin
 */
const updateReservationStatusController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // 1. Validasi Input
        const { id } = req.params; // ID Reservasi
        const { status, comment } = req.body; // Status baru ('APPROVED' / 'REJECTED')
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // ID Admin (dari 'protect' middleware)
        if (!adminId) {
            return res.status(401).json({ message: 'User admin tidak terotentikasi' });
        }
        const reservationId = parseInt(id, 10);
        if (isNaN(reservationId)) {
            return res.status(400).json({ message: 'ID reservasi tidak valid' });
        }
        if (!status || (status !== 'APPROVED' && status !== 'REJECTED' && status !== 'CANCELED')) {
            return res.status(400).json({
                message: "Status tidak valid. Harus 'APPROVED', 'REJECTED', atau 'CANCELED'."
            });
        }
        // 2. Panggil "Otak" (Service) untuk melakukan pekerjaan berat
        const result = yield adminService.updateReservationStatus(reservationId, status, adminId, comment || null // Kirim null jika comment kosong
        );
        // 3. Kirim respon sukses
        return res.status(200).json(result);
    }
    catch (err) { // <-- Penanganan error yang aman
        // 4. Tangani error (mis: 404 Reservasi tidak ditemukan)
        if (err instanceof AppError_1.AppError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        if (err instanceof Error) {
            console.error(err.message);
            return res.status(500).send('Server error saat update status');
        }
        console.error(err);
        return res.status(500).send('Server error (unknown) saat update status');
    }
});
exports.updateReservationStatusController = updateReservationStatusController;
