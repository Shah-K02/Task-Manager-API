const express = require("express");
const Task = require("../models/Task");
const { asyncHandler } = require("../middleware/errorHandler");
const { authecateToken } = require("../middleware/auth");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authecateToken);

// @route GET /api/tasks
// @desc Get all tasks for the authenticated user
// @access Private
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { status, priority, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { owner: req.user._id };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Execute query#
    const tasks = await Task.find(query)
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 }); // Sort by createdAt descending

    const totalTasks = await Task.countDocuments(query);
    res.json({
      tasks,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: totalTasks,
        pages: Math.ceil(totalTasks / limitNumber),
      },
    });
  })
);

// @route POST /api/tasks/:id
// @desc Update a task by ID
// @access Private
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id, // Ensure user can only access their own tasks
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

// @route POST /api/tasks
// @desc Create a new task
// @access Private
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { title, description, status, priority, dueDate, tags } = req.body;

    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null, // Convert to Date object if provided
      owner: req.user._id, // Set the owner to the authenticated user
      tags: tags || [], // Default to empty array if not provided
    });

    await task.save();

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  })
);

// @route PUT /api/tasks/:id
// @desc Update a task by ID
// @access Private
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { title, description, status, priority, dueDate, tags } = req.body;
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id, // Ensure user can only update their own tasks
    });

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
        message: "Task not found or you do not have permission to update it",
      });
    }
    // Update task fields
    task.title = title;
    task.description = description;
    task.status = status;
    task.priority = priority;
    task.dueDate = dueDate;
    task.tags = tags;
    // Save updated task
    await task.save();

    res.json({
      message: "Task updated successfully",
      task,
    });
  })
);
// @route DELETE /api/tasks/:id
// @desc Delete a task by ID
// @access Private
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

// @router GET /api/tasks/stats/summary
// @desc Get task summary statistics for the authenticated user
// @access Private
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
