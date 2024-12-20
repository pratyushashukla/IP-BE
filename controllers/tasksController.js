// Controller To Handle all Task Related Operations

import Tasks from "../models/tasksModel.js";
import TaskAssignment from "../models/taskAssignmentModel.js";
import Inmate from "../models/inmateModel.js";
import mongoose from "mongoose";

// Declare a default filter variable
const defaultFilter = { isActive: true };

// Create Task
export const createTask = async (req, res) => {
  const { title, description, startDate, dueDate, assignedTo, assignedBy } =
    req.body;

  const assignedToObjectId = assignedTo
    ? new mongoose.Types.ObjectId(assignedTo)
    : null; // Convert to ObjectId
  const assignedByObjectId = assignedBy
    ? new mongoose.Types.ObjectId(assignedBy)
    : null; // Convert to ObjectId

  // Validation
  if (!title || !startDate || !dueDate || !assignedTo) {
    return res.status(400).json({
      message: "Title, Start Date, Due Date, and Assigned To are required",
    });
  }
  if (new Date(dueDate) < new Date(startDate)) {
    return res
      .status(400)
      .json({ message: "Due Date cannot be before Start Date" });
  }

  try {
    // Validate that each inmate exists
    const inmates = await Inmate.findOne({ _id: assignedToObjectId });
    if (inmates.length !== assignedToObjectId.length) {
      return res
        .status(404)
        .json({ message: "One or more assigned inmates not found" });
    }

    // Create Task
    const task = new Tasks({
      title,
      description,
      startDate,
      dueDate,
      assignedTo: assignedToObjectId, // Use the converted ObjectId here
      assignedBy: assignedByObjectId,
    });

    const createdTask = await task.save();

    const taskAssignment = new TaskAssignment({
      taskId: createdTask._id,
      inmateId: assignedToObjectId,
      completionStatus: false,
    });

    await taskAssignment.save();

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// List all tasks with assigned inmates
export const listTasks = async (req, res) => {
  try {
    const tasks = await Tasks.find(defaultFilter);

    // Fetch assignments and populate inmate names for each task
    const tasksWithAssignments = await Promise.all(
      tasks.map(async (task) => {
        const assignments = await TaskAssignment.find({
          taskId: task._id,
          ...defaultFilter,
        }).populate("inmateId", "firstName lastName");
        return { ...task.toObject(), assignments };
      })
    );

    res.status(200).json(tasksWithAssignments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Retrieve Individual Task with assigned inmates
export const getTaskById = async (req, res) => {
  const filter = { ...defaultFilter, _id: req.params.id }; // Include default filter with ID

  try {
    const task = await Tasks.findOne(filter);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Fetch the task's assignments
    const assignments = await TaskAssignment.find({
      taskId: req.params.id,
      ...defaultFilter,
    }).populate("inmateId", "firstName lastName");

    // Combine task and assignments into a single response
    const taskWithAssignments = {
      ...task.toObject(), // Convert task to plain object
      assignments, // Add assignments array to the task object
    };

    res.status(200).json(taskWithAssignments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// List Tasks by Filter Parameters
export const listTasksByParam = async (req, res) => {
  const { title, assignedTo, status, dueDate, startDate } = req.query;

  const filter = { ...defaultFilter }; // Include default filter

  if (title) {
    filter.title = new RegExp(title, "i"); // Case-insensitive search for task title
  }
  if (status) {
    filter.status = status;
  }
  if (dueDate) {
    filter.dueDate = { $eq: new Date(dueDate) };
  }
  if (startDate) {
    filter.startDate = { $eq: new Date(startDate) };
  }

  try {
    // Get filtered tasks
    const tasks = await Tasks.find(filter);

    // If filtering by assigned inmates, find related assignments
    let filteredTasks = tasks;
    if (assignedTo) {
      const taskAssignments = await TaskAssignment.find({
        inmateId: assignedTo,
        ...defaultFilter,
      });
      const taskIds = taskAssignments.map((assignment) =>
        assignment.taskId.toString()
      );
      filteredTasks = tasks.filter((task) =>
        taskIds.includes(task._id.toString())
      );
    }

    res.status(200).json(filteredTasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get Overdue Tasks
export const getOverdueTasks = async (req, res) => {
  try {
    const overdueTasks = await Tasks.find({
      ...defaultFilter, // Include default filter
      dueDate: { $lt: new Date() }, // Due date is in the past
      status: { $ne: "Completed" }, // Task is not completed
    });

    res.status(200).json(overdueTasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update Task API
export const updateTask = async (req, res) => {
  const {
    _id,
    title,
    description,
    startDate,
    dueDate,
    assignedBy,
    assignments,
    status,
  } = req.body;

  // Validation
  if (!title || !startDate || !dueDate || !assignments) {
    return res.status(400).json({
      message: "Title, Start Date, Due Date, and Assignments are required",
    });
  }
  if (new Date(dueDate) < new Date(startDate)) {
    return res
      .status(400)
      .json({ message: "Due Date cannot be before Start Date" });
  }

  try {
    // Check if task exists
    const existingTask = await Tasks.findById(_id);
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update task fields
    existingTask.title = title;
    existingTask.description = description;
    existingTask.status = status;
    existingTask.startDate = startDate;
    existingTask.dueDate = dueDate;
    existingTask.assignedBy = assignedBy
      ? new mongoose.Types.ObjectId(assignedBy)
      : null;
    existingTask.updatedAt = Date.now();

    // Save the updated task
    await existingTask.save();

    // Update task assignments
    for (let assignment of assignments) {
      const {
        _id: assignmentId,
        inmateId,
        completionStatus,
        progressNotes,
      } = assignment;

      // Convert inmateId to ObjectId
      const inmateObjectId = inmateId
        ? new mongoose.Types.ObjectId(inmateId._id)
        : null;

      // Check if the assignment already exists
      let existingAssignment = await TaskAssignment.findById(assignmentId);

      if (existingAssignment) {
        // Update the existing assignment
        existingAssignment.inmateId = inmateObjectId;
        existingAssignment.completionStatus = completionStatus;
        existingAssignment.progressNotes = progressNotes;
        existingAssignment.updatedAt = Date.now();
        await existingAssignment.save();
      } else {
        // Create a new assignment if it doesn't exist
        const newAssignment = new TaskAssignment({
          taskId: existingTask._id,
          inmateId: inmateObjectId,
          completionStatus,
          progressNotes,
        });
        await newAssignment.save();
      }
    }

    res
      .status(200)
      .json({
        message: "Task and assignments updated successfully",
        task: existingTask,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete Task
export const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    // Delete the task
    const task = await Tasks.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Delete related TaskAssignment entries
    await TaskAssignment.deleteOne({ taskId: id });

    res
      .status(200)
      .json({ message: "Task and related assignments deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Close Task and Update Progress Report
export const closeTask = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the task by its ID
    const task = await Tasks.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Mark the task as Completed and set the endDate
    task.status = "Completed";
    task.endDate = new Date();
    await task.save();

    // Determine if the task was completed on time or overdue
    const isOverdue = task.endDate > task.dueDate;

    // Find all TaskAssignments associated with this task
    const taskAssignments = await TaskAssignment.find({ taskId: task._id });

    // Update progressNotes in TaskAssignment for all related assignments
    taskAssignments.forEach(async (assignment) => {
      if (isOverdue) {
        assignment.progressNotes = `Task '${task.title}' was not completed in time. Need to maintain pace.`;
      } else {
        assignment.progressNotes = `Task '${task.title}' was completed successfully on time.`;
      }
      await assignment.save(); // Save the updated TaskAssignment
    });

    res.status(200).json({
      message: "Task closed and progress report updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Assign Task to One or Multiple Inmates
export const assignTaskToInmates = async (req, res) => {
  const { taskId, inmateIds } = req.body;

  // Validation: Ensure taskId and inmateIds are provided
  if (!taskId || !inmateIds || !inmateIds.length) {
    return res
      .status(400)
      .json({ message: "Task ID and at least one inmate ID are required" });
  }

  try {
    // Validate that the task exists
    const task = await Tasks.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Validate that each inmate exists
    const inmates = await Inmate.find({ _id: { $in: inmateIds } });
    if (inmates.length !== inmateIds.length) {
      return res.status(404).json({ message: "Assigned inmates not found" });
    }

    // Create TaskAssignment entries for each inmate
    const assignments = inmateIds.map((inmateId) => ({
      taskId,
      inmateId,
      completionStatus: false, // Initially, the task is not completed
      progressNotes: "Task assigned",
    }));

    // Save all assignments in bulk
    await TaskAssignment.insertMany(assignments);

    res
      .status(201)
      .json({ message: "Task assigned to inmates successfully", assignments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update Task Status
export const updateTaskStatus = async (req, res) => {
  const { id } = req.params; // Task ID
  const { status } = req.body; // New status
  try {
    // Find the task by ID
    const task = await Tasks.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update the task status
    task.status = status;

    // Save the updated task
    await task.save();

    // Send a success response with the updated task
    res.status(200).json({ message: "Task status updated successfully", task });
  } catch (error) {
    // Handle any server error
    res.status(500).json({ message: "Server error", error });
  }
};
