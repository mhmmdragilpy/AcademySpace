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
exports.loginUser = exports.registerUser = void 0;
// Impor 'otak' kita
const authService = __importStar(require("../services/authService"));
// Impor error kustom kita
const AppError_1 = require("../utils/AppError");
/**
 * @route   POST /api/auth/register
 * @desc    Mendaftarkan user baru
 * @access  Public
 */
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Validasi input dasar
        const { email, password, full_name } = req.body;
        if (!email || !password || !full_name) {
            return res.status(400).json({ message: 'Semua field harus diisi' });
        }
        // 2. Panggil 'otak' (Service) untuk melakukan pekerjaan berat
        const newUser = yield authService.register(email, password, full_name);
        // 3. Kirim respon sukses
        return res.status(201).json({
            message: 'User berhasil dibuat',
            user: newUser,
        });
    }
    catch (err) {
        // 4. Tangani error
        if (err instanceof AppError_1.AppError) {
            // Jika ini error yang kita prediksi (mis: 'Email sudah terdaftar')
            return res.status(err.statusCode).json({ message: err.message });
        }
        // Jika ini error tak terduga (bug)
        console.error(err);
        return res.status(500).send('Server error');
    }
});
exports.registerUser = registerUser;
/**
 * @route   POST /api/auth/login
 * @desc    Login user dan dapatkan token
 * @access  Public
 */
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Validasi input dasar
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email dan password harus diisi' });
        }
        // 2. Panggil 'otak' (Service) untuk login
        const data = yield authService.login(email, password);
        // 3. Kirim respon sukses
        return res.json(Object.assign({ message: 'Login berhasil' }, data));
    }
    catch (err) {
        // 4. Tangani error
        if (err instanceof AppError_1.AppError) {
            // Jika ini error yang kita prediksi (mis: 'Kredensial tidak valid')
            return res.status(err.statusCode).json({ message: err.message });
        }
        // Jika ini error tak terduga (bug)
        console.error(err);
        return res.status(500).send('Server error');
    }
});
exports.loginUser = loginUser;
