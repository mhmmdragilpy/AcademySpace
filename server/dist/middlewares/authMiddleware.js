import jwt from "jsonwebtoken";
import { sendError } from "../utils/response.js";
// [USE CASE #1] Membuat atau Masuk Akun - Proteksi Route dengan Token JWT
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return sendError(res, 401, "Access denied. No token provided.");
    }
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET is not defined!");
            return sendError(res, 500, "Internal server error");
        }
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        return sendError(res, 403, "Invalid token.");
    }
};
export const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    }
    else {
        return sendError(res, 403, "Access denied. Admin only.");
    }
};
export const authorizeVerificator = (req, res, next) => {
    // Cast to check for admin_verificator since it might not be in UserRole if strict
    // but assuming UserRole includes it if defined in models.
    // My UserRole definition: 'admin' | 'user'. 
    // Wait, authController used 'admin_verificator'.
    // I need to update UserRole in types/models/index.ts if 'admin_verificator' is valid.
    // The prompt shows 'admin_verificator' in authController.ts.
    // I should check types/models/index.ts again.
    if (req.user && (req.user.role === 'admin' || req.user.role === 'admin_verificator')) {
        next();
    }
    else {
        return sendError(res, 403, "Access denied. Verificator or Admin only.");
    }
};
//# sourceMappingURL=authMiddleware.js.map