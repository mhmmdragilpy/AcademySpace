import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        username: z.string().min(3),
        password: z.string().min(6),
        confirmPassword: z.string().min(6),
        role: z.enum(['user', 'admin']).optional(),
        admin_token: z.string().optional(),
    }).refine((data) => {
        if (data.role === 'admin' && !data.admin_token) {
            return false;
        }
        return true;
    }, {
        message: "Admin token is required for admin registration",
        path: ["body", "admin_token"]
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["body", "confirmPassword"],
    }),
});

export const loginSchema = z.object({
    body: z.object({
        username: z.string(),
        password: z.string(),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        username: z.string(),
        token: z.string(),
        newPassword: z.string().min(6),
    }),
});

