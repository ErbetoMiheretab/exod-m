// src/modules/users/services/userService.js

import { hash, compare } from 'bcrypt';

import { AppError } from '../../../shared/utils/errors.js';
import roleRepository from '../repositories/roleRepository.js';
import userRepository from '../repositories/userRepository.js';
// const eventBus = require('../../../events/eventBus');
// const { USER_CREATED, USER_UPDATED, USER_DELETED } = require('../../../events/eventTypes');

const { findByEmail, create, findById, findAll, update, remove, updatePassword, updateLastLogin } = userRepository


class UserService {

   async validateUserCredentials(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) return null;

    const isValid = await compare(password, user.password);
    if (!isValid) return null;

    return user;
  }
  
  async createUser(userData) {
    // Check if email already exists
    const existingUser = await findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    // Verify role exists
    const role = await roleRepository.findById(userData.roleId);
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    // Hash password
    const hashedPassword = await hash(userData.password, 12);

    // Create user
    const user = await create({
      ...userData,
      password: hashedPassword
    });

    // Emit event
    // eventBus.emit(USER_CREATED, { userId: user.id, user });

    // Remove password from response
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserById(id) {
    const user = await findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserByEmail(email) {
    const user = await findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAllUsers(filters) {
    const result = await findAll(filters);

    // Remove passwords from all users
    result.users = result.users.map(user => {
      const { password: _password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return result;
  }

  async updateUser(id, userData) {
    const user = await findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // If email is being updated, check if it's already in use
    if (userData.email && userData.email !== user.email) {
      const existingUser = await findByEmail(userData.email);
      if (existingUser) {
        throw new AppError('Email already in use', 409);
      }
    }

    // If role is being updated, verify it exists
    if (userData.roleId) {
      const role = await roleRepository.findById(userData.roleId);
      if (!role) {
        throw new AppError('Role not found', 404);
      }
    }

    const updatedUser = await update(id, userData);

    // Emit event
    // eventBus.emit(USER_UPDATED, { userId: id, updates: userData });

    const { password: _password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async deleteUser(id) {
    const user = await findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await remove(id);

    // Emit event
    // eventBus.emit(USER_DELETED, { userId: id });

    return { message: 'User deleted successfully' };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12);

    // Update password
    await updatePassword(userId, hashedPassword);

    return { message: 'Password changed successfully' };
  }

  async updateLastLogin(userId) {
    return await updateLastLogin(userId);
  }

  async getUserStats() {
    const [total, active, inactive] = await Promise.all([
      findAll({ limit: 1 }),
      findAll({ active: 'true', limit: 1 }),
      findAll({ active: 'false', limit: 1 })
    ]);

    return {
      total: total.pagination.total,
      active: active.pagination.total,
      inactive: inactive.pagination.total
    };
  }
}

export default new UserService();