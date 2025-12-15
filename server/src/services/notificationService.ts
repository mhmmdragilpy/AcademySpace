import { NotificationRepository } from '../repositories/NotificationRepository.js';

export class NotificationService {
    private notificationRepository: NotificationRepository;

    constructor() {
        this.notificationRepository = new NotificationRepository();
    }

    async getUserNotifications(userId: number) {
        return this.notificationRepository.findByUserId(userId);
    }

    async markAsRead(userId: number, notificationId: number) {
        return this.notificationRepository.markRead(userId, notificationId);
    }

    async markAllAsRead(userId: number) {
        return this.notificationRepository.markAllRead(userId);
    }

    async deleteNotification(userId: number, notificationId: number) {
        return this.notificationRepository.deleteNotification(userId, notificationId);
    }
}

export const notificationService = new NotificationService();