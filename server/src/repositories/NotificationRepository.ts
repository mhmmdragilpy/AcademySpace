import { BaseRepository } from './BaseRepository.js';
import type { Notification } from '../types/models/index.js';

export class NotificationRepository extends BaseRepository<Notification> {
    protected tableName = 'notifications';
    protected primaryKey = 'notification_id';

    async findByUserId(userId: number) {
        const query = `
            SELECT * FROM notifications 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `;
        const result = await this.query(query, [userId]);
        return result.rows;
    }

    async createNotification(userId: number, message: string) {
        return this.create({
            user_id: userId,
            message,
            is_read: false
        });
    }

    async markRead(userId: number, notificationId: number) {
        const query = `
            UPDATE notifications SET is_read = true 
            WHERE notification_id = $1 AND user_id = $2 
            RETURNING *
        `;
        const result = await this.query(query, [notificationId, userId]);
        return result.rows[0] || null;
    }

    async markAllRead(userId: number) {
        await this.query(
            `UPDATE notifications SET is_read = true WHERE user_id = $1`,
            [userId]
        );
    }

    async deleteNotification(userId: number, notificationId: number) {
        const query = `
            DELETE FROM notifications 
            WHERE notification_id = $1 AND user_id = $2 
            RETURNING *
        `;
        const result = await this.query(query, [notificationId, userId]);
        return result.rows[0] || null;
    }
}
