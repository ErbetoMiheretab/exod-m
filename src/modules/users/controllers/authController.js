// src/modules/auth/authController.js
import crypto from 'crypto';

import jwt from 'jsonwebtoken';

import { jwtRefreshSecret } from '../../../config/env.js'; 
import { UnauthorizedError, BadRequestError } from '../../../shared/utils/errors.js';
import { successResponse } from '../../../shared/utils/responses.js';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  hashToken, 
  cookieConfig 
} from '../../../shared/utils/tokens.js';
import sessionRepository from '../../users/repositories/sessionRepository.js';
import userService from '../services/userService.js';
// ... other imports (tokens, errors, responses)

class AuthController {
  
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // 1. Validate Credentials
      if (!email || !password) {
        throw new BadRequestError('Email and password are required');
      }

      // 2. Find User (and get password hash)
      // We assume userService has a method that returns the user with password
      // If userService.getUserByEmail strips password, you might need a dedicated auth method
      const user = await userService.validateUserCredentials(email, password); 
      
      if (!user) {
        throw new UnauthorizedError('Invalid credentials');
      }

      if (!user.active) {
        throw new UnauthorizedError('Account is inactive');
      }

      // 3. Prepare Session Data
      // Map permissions (assuming role.permissions is loaded)
      const permissions = user.role.permissions.map(p => p.code);
      
      const sessionPayload = {
        userId: user.id,
        role: user.role.name,
        permissions: permissions, 
        active: user.active
      };

      // 4. Generate Session & Tokens
      const sessionId = crypto.randomUUID(); 
      
      const refreshToken = generateRefreshToken({ userId: user.id, sessionId });
      const refreshTokenHash = hashToken(refreshToken);

      // 5. Save to Redis
      await sessionRepository.create(sessionId, {
        ...sessionPayload,
        refreshTokenHash, 
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        createdAt: new Date().toISOString()
      });

      // 6. Generate Access Token
      const accessToken = generateAccessToken({ userId: user.id, sessionId });

      // 7. Send Cookies
      res.cookie('accessToken', accessToken, {
        ...cookieConfig,
        maxAge: 15 * 60 * 1000 // 15 mins
      });

      res.cookie('refreshToken', refreshToken, {
        ...cookieConfig,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Remove sensitive data from response
      const { password: _password , ...userSafe } = user;

      return successResponse(res, { user: userSafe }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const incomingRefreshToken = req.cookies.refreshToken;
      if (!incomingRefreshToken) throw new UnauthorizedError('Refresh token missing');

      // 1. Verify JWT
      let decoded;
      try {
        decoded = jwt.verify(incomingRefreshToken, jwtRefreshSecret);
      } catch (e) { throw new UnauthorizedError('Invalid refresh token'); }

      // 2. Get Session from Redis
      const session = await sessionRepository.findById(decoded.sessionId);
      if (!session) {
        // If JWT is valid but session is gone, user probably logged out or expired
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        throw new UnauthorizedError('Session expired');
      }

      // 3. Reuse Detection
      const incomingHash = hashToken(incomingRefreshToken);
      if (session.refreshTokenHash !== incomingHash) {
        // Theft detected! Delete session immediately.
        await sessionRepository.delete(decoded.sessionId);
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        throw new UnauthorizedError('Token reuse detected');
      }

      // 4. Rotate
      const newRefreshToken = generateRefreshToken({ userId: session.userId, sessionId: decoded.sessionId });
      const newAccessToken = generateAccessToken({ userId: session.userId, sessionId: decoded.sessionId });

      // 5. Update Redis
      await sessionRepository.update(decoded.sessionId, {
        refreshTokenHash: hashToken(newRefreshToken)
      });

      // 6. Send Cookies
      res.cookie('accessToken', newAccessToken, {
        ...cookieConfig,
        maxAge: 15 * 60 * 1000
      });

      res.cookie('refreshToken', newRefreshToken, {
        ...cookieConfig,
        maxAge: 7 * 24 * 60 * 60 * 1000
      });


      return successResponse(res, null, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const token = req.cookies.accessToken;
      if (token) {
        const decoded = jwt.decode(token);
        if (decoded?.sessionId) {
          // Simply delete key from Redis
          await sessionRepository.delete(decoded.sessionId);
        }
      }
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return successResponse(res, null, 'Logged out');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();