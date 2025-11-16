const successResponse = (
  res,
  data = null,
  message = 'Success',
  statusCode = 200,
  context = {}
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    ...context,
  });
};

const errorResponse = (res, error, context = {}) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Something went wrong';

  const payload = {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    ...context,
  };

  if (error.errors && Array.isArray(error.errors)) {
    payload.errors = error.errors;
  }

  res.status(statusCode).json(payload);
};

const paginatedResponse = (
  res,
  data,
  pagination,
  message = 'Success',
  context = {}
) => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
    ...context,
  });
};

export default {
  successResponse,
  errorResponse,
  paginatedResponse,
};
