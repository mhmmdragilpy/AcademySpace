import { z } from 'zod';

export const createRatingSchema = z.object({
    body: z.object({
        reservationId: z.number().int(),
        facilityId: z.number().int(),
        rating: z.number().int().min(1).max(5),
        review: z.string().optional(),
    }),
});

export const facilityIdSchema = z.object({
    params: z.object({
        facilityId: z.string().regex(/^\d+$/).transform(Number),
    }),
});

export const ratingReservationIdSchema = z.object({
    params: z.object({
        reservationId: z.string().regex(/^\d+$/).transform(Number),
    }),
});
