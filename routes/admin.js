const express = require("express");
const Task = require("../models/Task");
const User = require("../models/User");
const { asyncHandler } = require("../middleware/errorHandler");
const { requireAdmin, authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// @route GET /api/admin/tasks
// @desc Get all tasks (admin only)
// @access Private (Admin)
router.get(
  "/tasks",
  asyncHandler(async (req, res) => {
    const { status, priority, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Execute query with user population
    const tasks = await Task.find(query)
      .populate("owner", "username email") // Populate owner details
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 }); // Sort by createdAt descending

    const total = await Task.countDocuments(query);
    res.json({
      tasks,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber),
      },
    });
  })
);

// @route GET /api/admin/users
// @desc Get all users (admin only)
// @access Private (Admin)
router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};

    if (role) {
      query.role = role; // Filter by role if provided
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const users = await User.find(query)
      .select("-password") // Exclude password from response
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);
    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  })
);

// @route   GET /api/admin/stats
// @desc    Get system statistics (admin only)
// @access  Private (Admin)
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    // User stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: "admin" });

    // Task stats
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: "completed" });
    const pendingTasks = await Task.countDocuments({ status: "pending" });
    const overdueTasks = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $ne: "completed" },
    });

    // Tasks by status
    const tasksByStatus = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Tasks by priority
    const tasksByPriority = await Task.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const recentTasks = await Task.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        admins: adminUsers,
        recent: recentUsers,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        overdue: overdueTasks,
        recent: recentTasks,
        byStatus: tasksByStatus.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        byPriority: tasksByPriority.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
      },
    };

    res.json({ stats });
  })
);

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Private (Admin)
router.put(
  "/users/:id/status",
  asyncHandler(async (req, res) => {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        error: "Invalid input",
        message: "isActive must be a boolean value",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "User not found",
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        error: "Invalid operation",
        message: "You cannot deactivate your own account",
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  })
);

// @route   DELETE /api/admin/tasks/:id
// @desc    Delete any task (admin only)
// @access  Private (Admin)
router.delete(
  "/tasks/:id",
  asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
        message: "Task not found",
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      message: "Task deleted successfully",
    });
  })
);

module.exports = router;
