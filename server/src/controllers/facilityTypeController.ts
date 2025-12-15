import type { Request, Response } from "express";
import { query } from "../db/index.js";
import { sendSuccess } from "../utils/response.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getAllFacilityTypes = catchAsync(async (req: Request, res: Response) => {
    const result = await query(`
        SELECT type_id, name, description
        FROM facility_types
        ORDER BY name ASC
    `);

    sendSuccess(res, result.rows);
});
