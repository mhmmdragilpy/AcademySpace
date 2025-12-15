import { z } from 'zod';

export const createFacilitySchema = z.object({
    body: z.object({
        name: z.string().min(2),
        type: z.string(),
        building: z.string(),
        roomNumber: z.string(),
        capacity: z.number().int().positive(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
    }),
});

export const updateFacilitySchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
    }),
    body: z.object({
        name: z.string().min(2).optional(),
        type: z.string().optional(),
        building: z.string().optional(),
        roomNumber: z.string().optional(),
        capacity: z.number().int().positive().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
    }),
});

export const facilityIdSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
    }),
});

export const getFacilitiesQuerySchema = z.object({
    query: z.object({
        building: z.string().optional(),
        type: z.string().optional(),
        capacity: z.string().regex(/^\d+$/).transform(Number).optional(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format YYYY-MM-DD").optional(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format HH:MM").optional(),
        endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format HH:MM").optional(),
        search: z.string().optional(),
    }),
});
