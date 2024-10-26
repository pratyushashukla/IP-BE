import mongoose from "mongoose";

const tasksSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 255,
  },
  description: {
    type: String,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,  // Refers to the Staff member who created the task
    ref: 'User',  //Staff collection
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],  // Task status
    default: 'Pending',
  },
  startDate: {
    type: Date,
  },
  endDate: {  // Date on which task is completed
    type: Date,
  },
  dueDate: {
    type: Date, // Expected date for completing task
    required: true,
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
tasksSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Tasks = mongoose.models.Tasks || mongoose.model('Tasks', tasksSchema);

export default Tasks;
