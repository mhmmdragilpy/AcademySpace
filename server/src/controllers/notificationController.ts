import type { Request, Response } from "express";
import { notificationService } from "../services/notificationService.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";

export const getUserNotifications = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const result = await notificationService.getUserNotifications(userId);
    sendSuccess(res, result);
});

export const markNotificationAsRead = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    // Assuming ID is passed in params for consistency, but legacy used body.
    // Let's support params if possible or body. Legacy code used body: { notificationId }
    // Ideally it should be PUT /notifications/:id/read

    // Check if params has ID, else try body
    const notificationId = req.params.id ? parseInt(req.params.id) : req.body.notificationId;

    if (!notificationId) throw new AppError("Notification ID is required", 400);

    const updated = await notificationService.markAsRead(userId, notificationId);

    if (!updated) {
        throw new AppError("Notification not found", 404);
    }

    sendSuccess(res, { message: "Notification marked as read" });
});

export const markAllNotificationsAsRead = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    await notificationService.markAllAsRead(userId);
    sendSuccess(res, { message: "All notifications marked as read" });
});

export const deleteNotification = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const notificationId = parseInt(req.params.id || "0");

    const deleted = await notificationService.deleteNotification(userId, notificationId);

    if (!deleted) {
        throw new AppError("Notification not found", 404);
    }

    sendSuccess(res, { message: "Notification deleted" });
});