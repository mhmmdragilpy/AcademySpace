import { Router } from "express";
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    promoteToAdmin,
    demoteToUser,
    createUser,
    updateProfileAvatar,
    deleteProfileAvatar,
    getMyProfile,
    updateMyProfile
} from "../controllers/userController.js";
import { authenticateToken, authorizeAdmin } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { createUserSchema, updateUserSchema, userIdSchema } from "../schemas/user.schema.js";

const router = Router();

// User profile routes (authenticated users can manage their own profile)
router.get("/profile", authenticateToken, getMyProfile);
router.put("/profile", authenticateToken, updateMyProfile);
router.put("/profile/avatar", authenticateToken, upload.single("avatar"), updateProfileAvatar);
router.delete("/profile/avatar", authenticateToken, deleteProfileAvatar);

// Admin only routes
router.post("/", authenticateToken, authorizeAdmin, validate(createUserSchema), createUser);
router.get("/", authenticateToken, authorizeAdmin, getAllUsers);
router.get("/:id", authenticateToken, authorizeAdmin, validate(userIdSchema), getUserById);
router.put("/:id", authenticateToken, authorizeAdmin, validate(updateUserSchema), updateUser);
router.delete("/:id", authenticateToken, authorizeAdmin, validate(userIdSchema), deleteUser);
router.put("/:id/promote", authenticateToken, authorizeAdmin, validate(userIdSchema), promoteToAdmin);
router.put("/:id/demote", authenticateToken, authorizeAdmin, validate(userIdSchema), demoteToUser);

export default router;