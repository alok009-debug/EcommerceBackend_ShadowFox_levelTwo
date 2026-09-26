const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  // MySQL-specific error codes
  if (err.code === 'ER_DUP_ENTRY') {
    error = new ApiError(400, 'Duplicate entry — a unique field already exists');
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    error = new ApiError(400, 'Invalid reference (foreign key constraint failed)');
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    error = new ApiError(400, 'Cannot delete — record is referenced by other data');
  }
  if (err.code === 'ER_BAD_NULL_ERROR') {
    error = new ApiError(400, 'Required field is missing');
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;