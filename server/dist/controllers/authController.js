import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userService } from "../services/userService.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/response.js";
export const register = catchAsync(async (req, res) => {
    const { name, username, password, role, admin_token } = req.body;
    // Check if user already exists
    const existingUserUsername = await userService.findByUsername(username);
    if (existingUserUsername) {
        throw new AppError("User with this username already exists", 400);
    }
    // Admin Token Validation
    if (role === 'admin') {
        const isValidToken = await userService.validateAdminToken(admin_token);
        if (!isValidToken) {
            throw new AppError("Invalid admin token", 403);
        }
    }
    const newUser = await userService.create({
        name,
        username,
        password,
        role: role || "user",
    });
    const { password_hash, ...userWithoutPassword } = newUser;
    sendSuccess(res, userWithoutPassword, "User registered successfully");
});
export const login = catchAsync(async (req, res) => {
    const { username, password } = req.body;
    const user = await userService.findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        throw new AppError("Invalid credentials", 401);
    }
    // Check if user is suspended
    if (user.is_suspended) {
        throw new AppError("Your account has been suspended. Please contact administrator.", 403);
    }
    // Update last login
    // await userService.update(user.user_id, { last_login_at: new Date() }); // If method exists or add it
    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET || "secret_key", { expiresIn: "1d" });
    const { password_hash, ...userWithoutPassword } = user;
    sendSuccess(res, { token, user: userWithoutPassword }, "Login successful");
});
export const getMe = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const user = await userService.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }
    const { password_hash, ...userWithoutPassword } = user;
    sendSuccess(res, userWithoutPassword);
});
export const resetPassword = catchAsync(async (req, res) => {
    const { username, token, newPassword } = req.body;
    // Validate System Reset Token
    const isValidToken = await userService.validateResetToken(token);
    if (!isValidToken) {
        throw new AppError("Invalid reset token", 400);
    }
    const user = await userService.findByUsername(username);
    if (!user) {
        throw new AppError("User not found", 404);
    }
    await userService.update(user.user_id, { password: newPassword });
    sendSuccess(res, { message: "Password reset successfully" });
});
//# sourceMappingURL=authController.js.map