const { error } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return error(res, err.message, 400);
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return error(res, 'Unauthorized', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return error(res, 'Token expired', 401);
  }

  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return error(res, `A record with this ${field} already exists`, 409);
  }

  if (err.code === 'P2025') {
    return error(res, 'Record not found', 404);
  }

  if (err.code === 'P2003') {
    return error(res, 'Related record not found', 400);
  }

  return error(res, err.message || 'Internal Server Error', err.statusCode || 500);
};

module.exports = errorHandler;
