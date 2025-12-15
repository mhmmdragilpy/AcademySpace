
import type { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.js';

export const uploadFile = (req: Request, res: Response) => {
    if (!req.file) {
        return sendError(res, 400, 'No file uploaded');
    }

    // Build full URL for the uploaded file
    const protocol = req.protocol;
    const host = req.get('host');
    const fullUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    sendSuccess(res, { url: fullUrl }, 'File uploaded successfully');
};
