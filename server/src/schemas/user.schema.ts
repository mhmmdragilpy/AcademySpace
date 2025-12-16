import { z } from 'zod';

export const createUserSchema = z.object({
    body: z.object({
        full_name: z.string().min(2, "Full Name must be at least 2 characters"),
        username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username must contain only letters, numbers, and underscores"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        role: z.enum(['user', 'admin', 'admin_verificator']).optional(),
        profile_picture_url: z.string().optional().nullable(),
    }),
});

export const updateUserSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
    }),
    body: z.object({
        full_name: z.string().min(2).optional(),
        username: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/).optional(),
        password: z.string().min(6).optional(),
        role: z.enum(['user', 'admin', 'admin_verificator']).optional(),
        profile_picture_url: z.string().optional().nullable(),
        is_suspended: z.boolean().optional(),
    }),
});

export const userIdSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
    }),
});
