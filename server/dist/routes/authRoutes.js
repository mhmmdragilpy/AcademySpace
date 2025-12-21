import { Router } from "express";
import { register, login, getMe, resetPassword } from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { registerSchema, loginSchema, resetPasswordSchema } from "../schemas/auth.schema.js";
const router = Router();
router.post("/register", validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
// router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword); // Removed
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.get("/me", authenticateToken, getMe);
export default router;
//# sourceMappingURL=authRoutes.js.map