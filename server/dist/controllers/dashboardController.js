import { query } from "../db/index.js";
import logger from "../utils/logger.js";
export const getDashboardStats = async (req, res) => {
    try {
        // Users Count
        const usersResult = await query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
        const totalUsers = parseInt(usersResult.rows[0].count);
        // Facilities Count
        const facilitiesResult = await query("SELECT COUNT(*) as count FROM facilities");
        const totalFacilities = parseInt(facilitiesResult.rows[0].count);
        // Reservations Stats
        const reservationsResult = await query(`SELECT 
                COUNT(*) as total, 
                SUM(CASE WHEN rs.name = 'PENDING' THEN 1 ELSE 0 END) as pending
             FROM reservations r
             JOIN reservation_statuses rs ON r.status_id = rs.status_id`);
        const totalReservations = parseInt(reservationsResult.rows[0].total) || 0;
        const pendingReservations = parseInt(reservationsResult.rows[0].pending) || 0;
        // Recent Activities
        const recentActivitiesResult = await query(`SELECT 
                r.reservation_id as id, 
                u.full_name as user, 
                'Created reservation' as action, 
                r.created_at as time
             FROM reservations r
             JOIN users u ON r.requester_id = u.user_id
             ORDER BY r.created_at DESC
             LIMIT 5`);
        const recentActivities = recentActivitiesResult.rows.map(row => ({
            id: row.id,
            user: row.user,
            action: row.action,
            time: new Date(row.time).toLocaleString()
        }));
        res.json({
            totalUsers,
            totalFacilities,
            totalReservations,
            pendingReservations,
            recentActivities
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
export const getSystemTokens = async (req, res) => {
    try {
        const result = await query("SELECT key, value FROM system_tokens WHERE key IN ('ADMIN_REG_TOKEN', 'RESET_PASS_TOKEN')");
        const tokens = result.rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
        res.json(tokens);
    }
    catch (error) {
        logger.error("Get System Tokens Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
//# sourceMappingURL=dashboardController.js.map