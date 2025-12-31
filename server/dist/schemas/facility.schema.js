import { z } from 'zod';
export const createFacilitySchema = z.object({
    body: z.object({
        name: z.string().min(2),
        // Support both ID-based (new) and string-based (legacy) inputs
        type_id: z.number().int().positive().optional(),
        type: z.string().optional(),
        building_id: z.number().int().positive().nullable().optional(),
        building: z.string().optional(),
        room_number: z.string().nullable().optional(),
        roomNumber: z.string().optional(),
        capacity: z.number().int().positive().nullable().optional(),
        floor: z.number().int().nullable().optional(),
        description: z.string().nullable().optional(),
        layout_description: z.string().nullable().optional(),
        photo_url: z.string().nullable().optional(),
        imageUrl: z.string().optional(),
        is_active: z.boolean().optional(),
    }),
});
export const updateFacilitySchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive(),
    }),
    body: z.object({
        name: z.string().min(2).optional(),
        // Support both ID-based (new) and string-based (legacy) inputs
        type_id: z.number().int().positive().optional(),
        type: z.string().optional(),
        building_id: z.number().int().positive().nullable().optional(),
        building: z.string().optional(),
        room_number: z.string().nullable().optional(),
        roomNumber: z.string().optional(),
        capacity: z.number().int().positive().nullable().optional(),
        floor: z.number().int().nullable().optional(),
        description: z.string().nullable().optional(),
        layout_description: z.string().nullable().optional(),
        photo_url: z.string().nullable().optional(),
        imageUrl: z.string().optional(),
        is_active: z.boolean().optional(),
    }),
});
export const facilityIdSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive(),
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
//# sourceMappingURL=facility.schema.js.map