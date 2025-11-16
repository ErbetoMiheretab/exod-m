import logger from '../utils/logger';
import { errorResponse } from '../utils/responses';

class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error
  if (error.statusCode >= 500) {
    logger.error('Server Error:', {
      error: err,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      user: req.user?.id,
    });
  } else {
    logger.warn('Client Error:', {
      message: err.message,
      statusCode: error.statusCode,
      url: req.originalUrl,
      user: req.user?.id,
    });
  }

  // Prisma errors
  if (err.code === 'P2002') {
    error = new ConflictError('Resource already exists');
  } else if (err.code === 'P2025') {
    error = new NotFoundError('Resource not found');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new UnauthorizedError('Invalid token');
  } else if (err.name === 'TokenExpiredError') {
    error = new UnauthorizedError('Token expired');
  }

  // Validation errors
  if (err.name === 'ValidationError' && err.errors) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = new ValidationError('Validation failed', errors);
  }

  errorResponse(res, error);
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  errorHandler,
};
