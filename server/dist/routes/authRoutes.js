"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Impor KEDUA fungsi dari controller
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
// Rute untuk registrasi (sudah ada)
router.post('/register', authController_1.registerUser);
// Rute untuk login (baru)
router.post('/login', authController_1.loginUser); // <-- TAMBAHKAN BARIS INI
exports.default = router;
