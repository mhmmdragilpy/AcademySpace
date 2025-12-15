import { UserRepository } from '../repositories/UserRepository.js';
import type { User, UserRole } from '../types/models/index.js';
import bcrypt from 'bcryptjs';

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.findAll();
    }

    async findById(id: number): Promise<User | null> {
        return this.userRepository.findById(id);
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.userRepository.findByUsername(username);
    }

    async create(data: {
        name?: string;
        full_name?: string;
        username: string;
        password?: string;
        role?: UserRole;
        profile_picture_url?: string;
    }): Promise<User> {
        const { name, full_name, password, ...rest } = data;

        // Ensure full_name is populated
        const finalFullName = full_name || name;
        if (!finalFullName) {
            throw new Error("Full name or name is required");
        }

        const userToCreate: Partial<User> = {
            ...rest,
            full_name: finalFullName,
            role: rest.role || 'user',
        };

        if (password) {
            userToCreate.password_hash = await bcrypt.hash(password, 10);
        }

        return this.userRepository.create(userToCreate);
    }

    async update(id: number, data: Partial<User> & { password?: string; name?: string }): Promise<User | null> {
        const { password, name, ...rest } = data;
        const updateData: Partial<User> = { ...rest };

        if (name) updateData.full_name = name;
        if (password) {
            updateData.password_hash = await bcrypt.hash(password, 10);
        }

        return this.userRepository.update(id, updateData);
    }

    async delete(id: number): Promise<boolean> {
        return this.userRepository.delete(id);
    }

    // Auth Refactor Helpers
    async validateAdminToken(token: string): Promise<boolean> {
        return this.userRepository.validateSystemToken('ADMIN_REG_TOKEN', token);
    }

    async validateResetToken(token: string): Promise<boolean> {
        return this.userRepository.validateSystemToken('RESET_PASS_TOKEN', token);
    }
}

export const userService = new UserService();