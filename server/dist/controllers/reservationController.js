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
exports.getAvailabilityController = exports.cancelReservationController = exports.getMyReservationsController = exports.createReservationController = void 0;
// Impor 'otak' kita
const reservationService = __importStar(require("../services/reservationService"));
// Impor error kustom kita
const AppError_1 = require("../utils/AppError");
// --- FUNGSI CREATE RESERVATION (Tidak Berubah) ---
const createReservationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { purpose, attendees, items } = req.body;
        const requester_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!requester_id) {
            return res.status(401).json({ message: 'User tidak terotentikasi' });
        }
        if (!purpose || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: 'Input tidak valid. Membutuhkan "purpose" (string) dan "items" (array)'
            });
        }
        const newReservation = yield reservationService.createReservation({
            requester_id,
            purpose,
            attendees,
            items,
        });
        return res.status(201).json({
            message: 'Reservasi berhasil dibuat dan sedang menunggu approval',
            reservation: newReservation,
        });
    }
    catch (err) {
        if (err instanceof AppError_1.AppError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        if (err instanceof Error) {
            console.error(err.message);
            return res.status(500).send('Server error saat membuat reservasi');
        }
        console.error(err);
        return res.status(500).send('Server error (unknown) saat membuat reservasi');
    }
});
exports.createReservationController = createReservationController;
// --- FUNGSI GET RIWAYAT RESERVASI (Tidak Berubah) ---
const getMyReservationsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User tidak terotentikasi' });
        }
        const reservations = yield reservationService.getMyReservations(userId);
        return res.status(200).json(reservations);
    }
    catch (err) {
        if (err instanceof AppError_1.AppError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        if (err instanceof Error) {
            console.error(err.message);
            return res.status(500).send('Server error saat mengambil riwayat reservasi');
        }
        console.error(err);
        return res.status(500).send('Server error (unknown) saat mengambil riwayat');
    }
});
exports.getMyReservationsController = getMyReservationsController;
// --- FUNGSI CANCEL RESERVASI (Tidak Berubah) ---
const cancelReservationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params; // ID Reservasi
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // ID User yang mencoba membatalkan
        const reservationId = parseInt(id, 10);
        if (!userId || isNaN(reservationId)) {
            return res.status(400).json({ message: 'Data atau ID reservasi tidak valid.' });
        }
        const result = yield reservationService.cancelReservation(reservationId, userId);
        return res.status(200).json({
            message: result.message,
            status: result.status,
        });
    }
    catch (err) {
        if (err instanceof AppError_1.AppError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        if (err instanceof Error) {
            console.error(err.message);
            return res.status(500).send('Server error saat membatalkan reservasi');
        }
        console.error(err);
        return res.status(500).send('Server error (unknown) saat membatalkan reservasi');
    }
});
exports.cancelReservationController = cancelReservationController;
// ================================================
// --- FUNGSI BARU DIMULAI DI SINI ---
// ================================================
/**
 * @route   GET /api/reservations/availability/:facilityId?date=...
 * @desc    Mengecek slot waktu yang sudah dibooking
 * @access  Private (membutuhkan login)
 */
const getAvailabilityController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { facilityId } = req.params;
        // Ambil tanggal dari query string (e.g., ?date=2025-11-20)
        const date = req.query.date;
        const facilityIdNum = parseInt(facilityId, 10);
        if (isNaN(facilityIdNum) || !date) {
            return res.status(400).json({
                message: 'ID fasilitas atau tanggal (query parameter: ?date=YYYY-MM-DD) tidak valid.'
            });
        }
        // Panggil "Otak" (Service)
        const busySlots = yield reservationService.checkAvailability(facilityIdNum, date);
        // Kirim array slot yang sibuk
        return res.status(200).json(busySlots);
    }
    catch (err) {
        if (err instanceof AppError_1.AppError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        if (err instanceof Error) {
            console.error(err.message);
            return res.status(500).send('Server error saat mengecek ketersediaan');
        }
        console.error(err);
        return res.status(500).send('Server error (unknown) saat mengecek ketersediaan');
    }
});
exports.getAvailabilityController = getAvailabilityController;
