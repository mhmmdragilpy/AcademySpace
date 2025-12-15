import { z } from 'zod';

export const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(['user', 'admin']).optional(),
    }),
});

export const updateUserSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
    }),
    body: z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        role: z.enum(['user', 'admin']).optional(),
        department: z.string().optional(),
    }),
});

export const userIdSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
    }),
});
