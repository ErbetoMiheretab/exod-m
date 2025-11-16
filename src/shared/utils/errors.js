/**
 * Base application error
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad request error (400)
 */
class BadRequestError extends AppError {
  constructor(message = 'Bad request', errors = []) {
    super(message, 400, errors);
  }
}

/**
 * Validation error (400)
 */
class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, 400, errors);
  }
}

/**
 * Unauthorized error (401)
 * 
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Forbidden error (403)
 */
class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * Not found error (404)
 */
class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Conflict error (409)
 */
class ConflictError extends AppError {
  constructor(message = 'Conflict', errors = []) {
    super(message, 409, errors);
  }
}

/**
 * Too many requests error (429)
 */
class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

/**
 * Internal server error (500)
 */
class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}

export {
  AppError,
  BadRequestError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  InternalServerError
};