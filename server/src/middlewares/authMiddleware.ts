import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/response.js";
import type { UserRole } from "../types/models/index.js";
import { env } from "../config/env.js";

interface DecodedUser {
    id: number;
    role: UserRole;
    iat?: number;
    exp?: number;
}

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: DecodedUser;
        }
    }
}

// [USE CASE #1] Membuat atau Masuk Akun - Proteksi Route dengan Token JWT
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return sendError(res, 401, "Access denied. No token provided.");
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedUser;
        req.user = decoded;
        next();
    } catch (error) {
        return sendError(res, 401, "Invalid token.");
    }
};

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return sendError(res, 403, "Access denied. Admin only.");
    }
};

export const authorizeVerificator = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return sendError(res, 403, "Access denied. Verificator or Admin only.");
    }
};