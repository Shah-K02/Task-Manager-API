const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [100, "Task title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Task description cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value >= new Date();
        },
        message: "Due date must be in the future",
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [20, "Tag cannot exceed 20 characters"],
      },
    ],
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Update completedAt when status changes to completed
taskSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "completed" && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== "completed") {
      this.completedAt = undefined;
    }
  }
  next();
});

// Index for faster queries
taskSchema.index({ owner: 1, status: 1 });
taskSchema.index({ owner: 1, createdAt: -1 });
taskSchema.index({ dueDate: 1 });

// Static method to find tasks by owner
taskSchema.statics.findByOwner = function (ownerId) {
  return this.find({ owner: ownerId }).sort({ createdAt: -1 });
};

// Static method to find tasks by status
taskSchema.statics.findByStatus = function (ownerId, status) {
  return this.find({ owner: ownerId, status }).sort({ createdAt: -1 });
};

// Instance method to check if task is overdue
taskSchema.methods.isOverdue = function () {
  return (
    this.dueDate && this.dueDate < new Date() && this.status !== "completed"
  );
};

module.exports = mongoose.model("Task", taskSchema);
