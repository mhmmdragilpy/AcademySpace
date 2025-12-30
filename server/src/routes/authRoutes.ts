import { Router } from "express";
import { register, login, getMe, resetPassword } from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { registerSchema, loginSchema, resetPasswordSchema } from "../schemas/auth.schema.js";

const router = Router();

// [USE CASE #1] Membuat atau Masuk Akun - Route Register & Login
router.post("/register", validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);

// [USE CASE #2] Mereset Password - Route Reset Password
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

// [USE CASE #1] [USE CASE #3] - Route Cek User Login
router.get("/me", authenticateToken, getMe);

export default router;

