import { error as _error, warn } from '../utils/logger';
import { errorResponse } from '../utils/responses';
import { ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError, DatabaseError } from '../utils/errors';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.timestamp = new Date().toISOString();

  // Log error with audit trail
  if (error.statusCode >= 500) {
    _error('Server Error:', {
      error: err,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      user: req.user?.id,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: error.timestamp,
    });
  } else {
    warn('Client Error:', {
      message: err.message,
      statusCode: error.statusCode,
      url: req.originalUrl,
      user: req.user?.id,
      ip: req.ip,
      timestamp: error.timestamp,
    });
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    error = new ConflictError('Resource already exists');
  } else if (err.code === 'P2025') {
    error = new NotFoundError('Resource not found');
  } else if (err.code && err.code.startsWith('P20')) {
    error = new DatabaseError('Database operation failed');
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new UnauthorizedError('Invalid token');
  } else if (err.name === 'TokenExpiredError') {
    error = new UnauthorizedError('Token expired');
  }

  // Handle validation errors from express-validator or similar
  if (err.name === 'ValidationError' && err.errors) {
    const errors = Array.isArray(err.errors) 
      ? err.errors.map(e => ({
          field: e.param || e.path,
          message: e.msg || e.message,
        }))
      : Object.values(err.errors).map(e => ({
          field: e.path,
          message: e.message,
        }));
    error = new ValidationError('Validation failed', errors);
  }

  // Handle multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE' || err.code === 'LIMIT_FILE_COUNT') {
    error = new ValidationError(err.message);
  }

  // Send error response
  errorResponse(res, error);
};

export default { errorHandler };