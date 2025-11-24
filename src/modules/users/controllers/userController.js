// src/modules/users/controllers/userController.js

import { successResponse } from '../../../shared/utils/responses.js';
import createUserDto from '../dto/createUser.dto.js';
import updateUserDto from '../dto/updateUser.dto.js';
import userService from '../services/userService.js';

const { createUser , getUserById , getAllUsers , updateUser, deleteUser , changePassword, getUserStats } = userService

class UserController {
  async createUser(req, res, next) {
    try {
      const userData = createUserDto.from(req.body);
      const user = await createUser(userData);

      return successResponse(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await getUserById(id);

      return successResponse(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search,
        department: req.query.department,
        clearanceLevel: req.query.clearanceLevel,
        active: req.query.active,
        roleId: req.query.roleId
      };

      const result = await getAllUsers(filters);

      return successResponse(res, result, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const userData = updateUserDto.from(req.body);
      const user = await updateUser(id, userData);

      return successResponse(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await deleteUser(id);

      return successResponse(res, result, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.user.id; // From auth middleware
      const { currentPassword, newPassword } = req.body;

      const result = await changePassword(userId, currentPassword, newPassword);

      return successResponse(res, result, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUserProfile(req, res, next) {
    try {
      const userId = req.user.id; // From auth middleware
      const user = await getUserById(userId);

      return successResponse(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUserStats(req, res, next) {
    try {
      const stats = await getUserStats();

      return successResponse(res, stats, 'User statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();