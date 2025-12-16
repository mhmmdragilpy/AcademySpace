import type { Request, Response } from "express";
import { userService } from "../services/userService.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess, sendCreated } from "../utils/response.js";

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.findAll();
    const safeUsers = result.map(u => {
        const { password_hash, ...rest } = u as any;
        return rest;
    });
    sendSuccess(res, safeUsers);
});

export const getUserById = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || '0');
    const user = await userService.findById(id);

    if (!user) {
        throw new AppError("User not found", 404);
    }
    const { password_hash, ...safeUser } = user as any;
    sendSuccess(res, safeUser);
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || '0');

    // Check username uniqueness if updating username
    if (req.body.username) {
        const existing = await userService.findByUsername(req.body.username);
        if (existing && existing.user_id !== id) {
            throw new AppError("Username already in use", 400);
        }
    }

    const updatedUser = await userService.update(id, req.body);
    if (!updatedUser) {
        throw new AppError("User not found", 404);
    }
    const { password_hash, ...safeUser } = updatedUser as any;
    sendSuccess(res, safeUser);
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || '0');
    const user = await userService.findById(id);
    if (!user) throw new AppError("User not found", 404);

    await userService.delete(id);

    const { password_hash, ...safeUser } = user as any;
    sendSuccess(res, { message: "User deleted successfully", user: safeUser });
});

export const promoteToAdmin = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || '0');
    const updatedUser = await userService.update(id, { role: 'admin' });
    if (!updatedUser) throw new AppError("User not found", 404);

    const { password_hash, ...safeUser } = updatedUser as any;
    sendSuccess(res, safeUser);
});

export const demoteToUser = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || '0');
    const updatedUser = await userService.update(id, { role: 'user' });
    if (!updatedUser) throw new AppError("User not found", 404);

    const { password_hash, ...safeUser } = updatedUser as any;
    sendSuccess(res, safeUser);
});

export const createUser = catchAsync(async (req: Request, res: Response) => {
    // Check username uniqueness
    if (req.body.username) {
        const existing = await userService.findByUsername(req.body.username);
        if (existing) throw new AppError("Username already in use", 400);
    }

    // Sanitize profile_picture_url
    if (req.body.profile_picture_url === "") {
        req.body.profile_picture_url = null;
    }

    // Force role to be 'user' - Admin creation is handled via token registration only
    req.body.role = 'user';

    const newUser = await userService.create(req.body);
    const { password_hash, ...safeUser } = newUser as any;
    sendCreated(res, safeUser);
});

export const updateProfileAvatar = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    if (!req.file) throw new AppError("No file uploaded", 400);

    const protocol = req.protocol;
    const host = req.get('host');
    const avatarUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    const updatedUser = await userService.update(userId, { profile_picture_url: avatarUrl });
    if (!updatedUser) throw new AppError("User not found", 404);

    const { password_hash, ...safeUser } = updatedUser as any;
    sendSuccess(res, safeUser);
});

export const deleteProfileAvatar = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const updatedUser = await userService.update(userId, { profile_picture_url: null } as any);

    if (!updatedUser) throw new AppError("User not found", 404);
    const { password_hash, ...safeUser } = updatedUser as any;
    sendSuccess(res, safeUser);
});

// Get current user's profile
export const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const user = await userService.findById(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }
    const { password_hash, ...safeUser } = user as any;
    sendSuccess(res, safeUser);
});

// Update current user's profile
export const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;



    // Extract allowed fields that user can update
    const { full_name, username, password, profile_picture_url } = req.body;
    const updateData: any = {};

    if (full_name) updateData.full_name = full_name;

    // Check username uniqueness if username is being updated
    if (username) {

        // Validate username format (alphanumeric and underscore only, 3-30 chars)
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
            throw new AppError("Username must be 3-30 characters and contain only letters, numbers, and underscores", 400);
        }
        const existingByUsername = await userService.findByUsername(username);
        if (existingByUsername && existingByUsername.user_id !== userId) {
            throw new AppError("Username already in use", 400);
        }
        updateData.username = username;
    }



    // Note: Email field has been removed from users table
    // If email support is needed in future, add findByEmail to userService

    // Hash password if being updated
    if (password) {
        updateData.password = password; // userService.update will hash it
    }

    if (profile_picture_url !== undefined) {
        updateData.profile_picture_url = profile_picture_url;
    }

    const updatedUser = await userService.update(userId, updateData);
    if (!updatedUser) {
        throw new AppError("User not found", 404);
    }

    const { password_hash, ...safeUser } = updatedUser as any;
    sendSuccess(res, safeUser, "Profile updated successfully");
});

// Suspend a user (admin only)
export const suspendUser = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || '0');
    const user = await userService.findById(id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    // Prevent suspending admin users
    if (user.role === 'admin') {
        throw new AppError("Cannot suspend admin users", 400);
    }

    const updatedUser = await userService.update(id, { is_suspended: true } as any);
    if (!updatedUser) {
        throw new AppError("Failed to suspend user", 500);
    }

    const { password_hash, ...safeUser } = updatedUser as any;
    sendSuccess(res, safeUser, "User suspended successfully");
});

// Unsuspend a user (admin only)
export const unsuspendUser = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || '0');
    const user = await userService.findById(id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const updatedUser = await userService.update(id, { is_suspended: false } as any);
    if (!updatedUser) {
        throw new AppError("Failed to unsuspend user", 500);
    }

    const { password_hash, ...safeUser } = updatedUser as any;
    sendSuccess(res, safeUser, "User unsuspended successfully");
});