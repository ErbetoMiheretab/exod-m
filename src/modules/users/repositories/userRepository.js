// src/modules/users/repositories/userRepository.js

import prisma from '../../../database/index.js'; 

class UserRepository {
  async create(userData) {
    return await prisma.user.create({
      data: userData,
      include: {
        role: {
          include: {
            permissions: true
          }
        }
      }
    });
  }

  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: true
          }
        }
      }
    });
  }

  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: true
          }
        }
      }
    });
  }

  async findAll(filters = {}) {
    const { page = 1, limit = 10, search, department, clearanceLevel, active, roleId } = filters;
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (department) where.department = department;
    if (clearanceLevel !== undefined) where.clearanceLevel = parseInt(clearanceLevel);
    // Handle boolean conversion from string query params
    if (active !== undefined) where.active = active === 'true';
    if (roleId) where.roleId = roleId;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          role: {
            include: {
              permissions: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async update(id, userData) {
    return await prisma.user.update({
      where: { id },
      data: userData,
      include: {
        role: {
          include: {
            permissions: true
          }
        }
      }
    });
  }

  async delete(id) {
    return await prisma.user.delete({
      where: { id }
    });
  }

  async updatePassword(id, hashedPassword) {
    return await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });
  }

  async updateLastLogin(id) {
    return await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() }
    });
  }

  async countByRole(roleId) {
    return await prisma.user.count({
      where: { roleId }
    });
  }

  async getUsersWithPermission(permissionCode) {
    return await prisma.user.findMany({
      where: {
        role: {
          permissions: {
            some: {
              code: permissionCode
            }
          }
        }
      },
      include: {
        role: true
      }
    });
  }
}

export default new UserRepository();