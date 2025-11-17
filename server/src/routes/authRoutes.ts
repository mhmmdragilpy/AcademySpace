import { Router } from 'express';
// Impor KEDUA fungsi dari controller
import { registerUser, loginUser } from '../controllers/authController';

const router = Router();

// Rute untuk registrasi (sudah ada)
router.post('/register', registerUser);

// Rute untuk login (baru)
router.post('/login', loginUser); // <-- TAMBAHKAN BARIS INI

export default router;
