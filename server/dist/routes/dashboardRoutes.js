import { Router } from "express";
import { getDashboardStats, getSystemTokens } from "../controllers/dashboardController.js";
import { authenticateToken, authorizeAdmin } from "../middlewares/authMiddleware.js";
const router = Router();
router.get("/stats", authenticateToken, authorizeAdmin, getDashboardStats);
router.get("/tokens", authenticateToken, authorizeAdmin, getSystemTokens);
export default router;
//# sourceMappingURL=dashboardRoutes.js.map