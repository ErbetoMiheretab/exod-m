// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

class DocumentRepository {
  async create(data, userId) {
    return prisma.document.create({
      data: {
        ...data,
        createdBy: userId,
        version: 1,
      },
    });
  }

  async findById(id, includeDeleted = false) {
    return prisma.document.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
        tags: true,
      },
    });
  }

  async findAll(filters, pagination) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(filters.type && { type: filters.type }),
      ...(filters.status && { status: filters.status }),
      ...(filters.createdBy && { createdBy: filters.createdBy }),
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { content: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdByUser: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.document.count({ where }),
    ]);

    return {
      data: documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id, data, userId) {
    // Implement optimistic locking with version control
    return prisma.document.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
        updatedAt: new Date(),
        version: { increment: 1 },
      },
    });
  }

  async softDelete(id, userId) {
    return prisma.document.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }
}

module.exports = new DocumentRepository();