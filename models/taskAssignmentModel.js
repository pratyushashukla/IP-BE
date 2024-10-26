import mongoose from "mongoose";

const taskAssignmentSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the task
      ref: "Tasks",
      required: true,
    },
    inmateId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the inmate
      ref: "Inmate",
      required: true,
    },
    completionStatus: {
      type: Boolean, // Whether the task is completed by the inmate
      default: false,
    },
    progressNotes: {
      type: String, // Notes about the inmate's progress on the task
      default: "Task Assigned",
    },
  },
  {
    timestamps: true,
  }
);

const TaskAssignment =
  mongoose.models.TaskAssignment ||
  mongoose.model("TaskAssignment", taskAssignmentSchema);

export default TaskAssignment;
