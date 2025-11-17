"use strict";
/*
 * ==================================
 * FILE: server/src/index.ts (FINAL BACKEND UPDATE)
 * ==================================
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
// 1. Import Dependencies
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pg_1 = require("pg");
// Impor SEMUA rute kita
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const facilityRoutes_1 = __importDefault(require("./routes/facilityRoutes"));
const reservationRoutes_1 = __importDefault(require("./routes/reservationRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const equipmentRoutes_1 = __importDefault(require("./routes/equipmentRoutes")); // <-- INI DIA DIAKTIFKAN
// 2. Setup Aplikasi Express
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '5000', 10);
// 3. Setup Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 4. Setup Koneksi Database
const pool = new pg_1.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
});
exports.pool = pool;
// Cek koneksi database saat server start (dengan tipe yang benar)
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('🔴 Error koneksi ke database:', err.stack);
    }
    else {
        console.log('🟢 Koneksi database PostgreSQL berhasil pada:', res.rows[0].now);
    }
});
// 5. Setup Routes (Rute)
app.get('/', (req, res) => {
    res.json({ message: 'Selamat datang di Academy Space API! 🚀 (TypeScript Version)' });
});
// Rute Publik & User
app.use('/api/auth', authRoutes_1.default);
app.use('/api/facilities', facilityRoutes_1.default);
app.use('/api/reservations', reservationRoutes_1.default);
// Rute Khusus Admin
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/equipment', equipmentRoutes_1.default); // <-- BARIS INI DIAKTIFKAN
// 6. Jalankan Server
app.listen(PORT, () => {
    console.log(`Server backend berjalan di http://localhost:${PORT}`);
});
