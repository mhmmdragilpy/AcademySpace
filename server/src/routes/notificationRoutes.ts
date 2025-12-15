import { Router } from "express";
import { 
    getUserNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification 
} from "../controllers/notificationController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authenticateToken, getUserNotifications);
router.put("/read", authenticateToken, markNotificationAsRead);
router.put("/read-all", authenticateToken, markAllNotificationsAsRead);
router.delete("/:id", authenticateToken, deleteNotification);

export default router;