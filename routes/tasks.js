const express = require("express");
const Task = require("../models/taskModel");
const { authenticateToken } = require("../middleware/authMiddlesware");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route   GET /api/tasks
// @desc    Get all tasks for authenticated user
// @access  Private
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { status, priority, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { owner: req.user._id };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  })
);

// @route   GET /api/tasks/:id
// @desc    Get single task by ID
// @access  Private
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
        message: "Task not found or you do not have permission to view it",
      });
    }

    res.json({ task });
  })
);

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { title, description, status, priority, dueDate, tags } = req.body;

    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: tags || [],
      owner: req.user._id,
    });

    await task.save();

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  })
);

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { title, description, status, priority, dueDate, tags } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
        message: "Task not found or you do not have permission to update it",
      });
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined)
      task.dueDate = dueDate ? new Date(dueDate) : null;
    if (tags !== undefined) task.tags = tags;

    await task.save();

    res.json({
      message: "Task updated successfully",
      task,
    });
  })
);

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
        message: "Task not found or you do not have permission to delete it",
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      message: "Task deleted successfully",
    });
  })
);

// @route   GET /api/tasks/stats/summary
// @desc    Get task statistics for user
// @access  Private
router.get(
  "/stats/summary",
  asyncHandler(async (req, res) => {
    const stats = await Task.aggregate([
      { $match: { owner: req.user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await Task.countDocuments({ owner: req.user._id });
    const overdue = await Task.countDocuments({
      owner: req.user._id,
      dueDate: { $lt: new Date() },
      status: { $ne: "completed" },
    });

    const summary = {
      total,
      overdue,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
    };

    res.json({ stats: summary });
  })
);

module.exports = router;
