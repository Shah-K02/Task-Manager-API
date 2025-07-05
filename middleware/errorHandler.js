const errorHandler = (error, req, res, next) => {
  console.error("Error:", error);

  // Default error
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors = null;

  // Mongoose validation error
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    errors = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
    }));
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    statusCode = 400;
    message = "Duplicate Error";
    const field = Object.keys(error.keyValue)[0];
    errors = [
      {
        field: field,
        message: `${field} already exists`,
      },
    ];
  }

  // Mongoose cast error (invalid ObjectId)
  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID Format";
    errors = [
      {
        field: error.path,
        message: "Invalid ID format",
      },
    ];
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Custom error (if you throw custom errors)
  if (error.statusCode) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // Send error response
  const errorResponse = {
    error: message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  res.status(statusCode).json(errorResponse);
};

// Async error handler wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = { errorHandler, asyncHandler };
