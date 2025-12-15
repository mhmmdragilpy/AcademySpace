import type { Response } from 'express';

export type ResponseStatus = 'success' | 'fail' | 'error';

export interface ApiResponse<T> {
    status: ResponseStatus;
    data: T | null;
    message: string | null;
}

export const sendResponse = <T>(
    res: Response,
    statusCode: number,
    data: T | null,
    message: string | null = null,
    status: ResponseStatus = 'success'
): void => {
    const response: ApiResponse<T> = {
        status,
        data,
        message,
    };
    res.status(statusCode).json(response);
};

export const sendSuccess = <T>(res: Response, data: T, message: string | null = null): void => {
    sendResponse(res, 200, data, message, 'success');
};

export const sendCreated = <T>(res: Response, data: T, message: string | null = null): void => {
    sendResponse(res, 201, data, message, 'success');
};

export const sendError = (
    res: Response,
    statusCode: number,
    message: string,
    status: ResponseStatus = 'error'
): void => {
    sendResponse(res, statusCode, null, message, status);
};
