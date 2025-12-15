import type { Request, Response } from "express";
import { query } from "../db/index.js";
import { sendSuccess } from "../utils/response.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getAllBuildings = catchAsync(async (req: Request, res: Response) => {
    const result = await query(`
        SELECT building_id, name, code, location_description, image_url, created_at, updated_at
        FROM buildings
        ORDER BY name ASC
    `);

    sendSuccess(res, result.rows);
});
