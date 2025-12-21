import { NotificationRepository } from '../repositories/NotificationRepository.js';
export class NotificationService {
    notificationRepository;
    constructor() {
        this.notificationRepository = new NotificationRepository();
    }
    async getUserNotifications(userId) {
        return this.notificationRepository.findByUserId(userId);
    }
    async markAsRead(userId, notificationId) {
        return this.notificationRepository.markRead(userId, notificationId);
    }
    async markAllAsRead(userId) {
        return this.notificationRepository.markAllRead(userId);
    }
    async deleteNotification(userId, notificationId) {
        return this.notificationRepository.deleteNotification(userId, notificationId);
    }
}
export const notificationService = new NotificationService();
//# sourceMappingURL=notificationService.js.map