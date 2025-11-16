import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';

import { UnauthorizedError } from '../utils/errors';

const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = verify(token, process.env.JWT_SECRET);

    // Example: expect decoded.sessionId or decoded.userId
    const session = await prisma.session.findUnique({
      where: { id: decoded.sessionId },
      include: {
        user: {
          include: {
            role: { include: { permissions: true } },
          },
        },
      },
    });

    if (!session || session.invalidatedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired session');
    }

    if (!session.user.active) {
      throw new UnauthorizedError('User account is inactive');
    }

    // Update last activity
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActivityAt: new Date() },
    });

    // Attach user and permissions to request
    req.user = session.user;
    req.session = session;
    req.permissions = session.user.role.permissions.map((p) => p.code);

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expired'));
    }
    next(error);
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    await authenticate(req, res, () => {});
  } catch (err) {
    // Log the error but continue without user
    logger.error('Authentication failed in optionalAuthenticate', {
      error: err.message,
      stack: err.stack,
      path: req.originalUrl,
    });
  }
  next();
};

export default {
  authenticate,
  optionalAuthenticate,
};
