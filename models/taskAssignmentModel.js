import mongoose from "mongoose";

const taskAssignmentSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,  // Reference to the task
    ref: 'Tasks',
    required: true,
  },
  inmateId: {
    type: mongoose.Schema.Types.ObjectId,  // Reference to the inmate
    ref: 'Inmate',
    required: true,
  },
  completionStatus: {
    type: Boolean,  // Whether the task is completed by the inmate
    default: false,
  },
  progressNotes: {
    type: String,  // Notes about the inmate's progress on the task
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Middleware to update `updatedAt` automatically
taskAssignmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const TaskAssignment = mongoose.models.TaskAssignment || mongoose.model('TaskAssignment', taskAssignmentSchema);

export default TaskAssignment;