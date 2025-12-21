import { UserRepository } from '../repositories/UserRepository.js';
import bcrypt from 'bcryptjs';
export class UserService {
    userRepository;
    constructor() {
        this.userRepository = new UserRepository();
    }
    async findAll() {
        return this.userRepository.findAll();
    }
    async findById(id) {
        return this.userRepository.findById(id);
    }
    async findByUsername(username) {
        return this.userRepository.findByUsername(username);
    }
    async create(data) {
        const { name, full_name, password, ...rest } = data;
        // Ensure full_name is populated
        const finalFullName = full_name || name;
        if (!finalFullName) {
            throw new Error("Full name or name is required");
        }
        const userToCreate = {
            ...rest,
            full_name: finalFullName,
            role: rest.role || 'user',
        };
        if (password) {
            userToCreate.password_hash = await bcrypt.hash(password, 10);
        }
        return this.userRepository.create(userToCreate);
    }
    async update(id, data) {
        const { password, name, ...rest } = data;
        const updateData = { ...rest };
        if (name)
            updateData.full_name = name;
        if (password) {
            updateData.password_hash = await bcrypt.hash(password, 10);
        }
        return this.userRepository.update(id, updateData);
    }
    async delete(id) {
        return this.userRepository.delete(id);
    }
    // Auth Refactor Helpers
    async validateAdminToken(token) {
        return this.userRepository.validateSystemToken('ADMIN_REG_TOKEN', token);
    }
    async validateResetToken(token) {
        return this.userRepository.validateSystemToken('RESET_PASS_TOKEN', token);
    }
}
export const userService = new UserService();
//# sourceMappingURL=userService.js.map