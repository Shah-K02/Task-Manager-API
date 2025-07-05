const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Task description cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "in progress", "done"],
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
        validator: function (v) {
          // Ensure dueDate is not in the past
          return v ? v >= new Date() : true;
        },
        message: "Due date cannot be in the past",
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
        maxlength: [30, "Tag cannot exceed 30 characters"],
      },
    ],
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

taskSchema.pre("save", function (next) {
  // Automatically set completedAt if status is 'done'
  if (this.isModified("status") && this.status === "done") {
    this.completedAt = new Date();
  } else if (this.isModified("status") && this.status !== "done") {
    this.completedAt = null; // Reset completedAt if status changes from 'done'
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
// Static method to find tasks by tag
taskSchema.statics.findByTag = function (ownerId, tag) {
  return this.find({ owner: ownerId, tags: tag }).sort({ createdAt: -1 });
};

// Instance method to check if task is overdue
taskSchema.methods.isOverdue = function () {
  return (
    this.dueDate && this.dueDate < new Date() && this.status !== "completed"
  );
};
export default mongoose.model("Task", taskSchema);
