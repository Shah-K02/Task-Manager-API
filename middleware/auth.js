const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer token format

    if (!token) {
      return res.status(401).json({
        error: "Access denied",
        message: "Access token is missing",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID from the token
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        error: "Access denied",
        message: "Invalid token - user not found",
      });
    }

    // Add user information to the request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Access denied",
        message: "Invalid token",
      });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Access denied",
        message: "Token expired",
      });
    }

    console.error("Authentication error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Authentication failed",
    });
  }
};

// Middleware to check for admin role
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Access denied",
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Access denied",
      message: "Admin role required",
    });
  }

  next();
};

// Middleware to check if user owns the resource
const checkOwnership = (req, res, next) => {
  // This will be used in task routes to ensure users can only access their own tasks
  // The actual ownership check will be done in the controller
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  checkOwnership,
};
