// USE CASE #11: Menerima Notifikasi Approval/Rejection - [Model]
import { BaseRepository } from './BaseRepository.js';
export class NotificationRepository extends BaseRepository {
    tableName = 'notifications';
    primaryKey = 'notification_id';
    // [USE CASE #11] Menerima Notifikasi Approval/Rejection - Query list notifikasi
    async findByUserId(userId) {
        const query = `
            SELECT * FROM notifications 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `;
        const result = await this.query(query, [userId]);
        return result.rows;
    }
    async createNotification(userId, message) {
        return this.create({
            user_id: userId,
            message,
            is_read: false
        });
    }
    async markRead(userId, notificationId) {
        const query = `
            UPDATE notifications SET is_read = true 
            WHERE notification_id = $1 AND user_id = $2 
            RETURNING *
        `;
        const result = await this.query(query, [notificationId, userId]);
        return result.rows[0] || null;
    }
    async markAllRead(userId) {
        await this.query(`UPDATE notifications SET is_read = true WHERE user_id = $1`, [userId]);
    }
    async deleteNotification(userId, notificationId) {
        const query = `
            DELETE FROM notifications 
            WHERE notification_id = $1 AND user_id = $2 
            RETURNING *
        `;
        const result = await this.query(query, [notificationId, userId]);
        return result.rows[0] || null;
    }
}
//# sourceMappingURL=NotificationRepository.js.map