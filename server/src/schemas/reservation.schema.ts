import { z } from 'zod';

export const reservationSchema = z.object({
    body: z.object({
        facilityId: z.coerce.number().int(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format YYYY-MM-DD"),
        startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format HH:MM"),
        endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format HH:MM"),
        purpose: z.string().min(5),
        participants: z.coerce.number().int().positive(),
        proposal_url: z.string().optional(),
    }),
});


export const reservationStatusSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive(),
    }),
    body: z.object({
        status: z.enum(['approved', 'rejected', 'cancelled', 'ongoing', 'completed']),
    }),
});

export const reservationIdSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive(),
    }),
});

export const updateReservationSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive(),
    }),
    body: z.object({
        purpose: z.string().min(5).optional(),
        participants: z.number().int().positive().optional(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format YYYY-MM-DD").optional(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format HH:MM").optional(),
        endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format HH:MM").optional(),
        proposal_url: z.string().optional(),
    }),
});
