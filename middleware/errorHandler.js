const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors = null;

  // Mongoose validation error
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate Error";
    const field = Object.keys(err.keyValue)[0];
    errors = [
      {
        field: field,
        message: `${field} already exists`,
      },
    ];
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID Format";
    errors = [
      {
        field: err.path,
        message: "Invalid ID format",
      },
    ];
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Custom error (if you throw custom errors)
  if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Send error response
  const errorResponse = {
    error: message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;

export function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
