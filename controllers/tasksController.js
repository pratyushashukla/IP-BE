// Controller To Handle all Task Related Operations

import Tasks from "../models/tasksModel.js";
import TaskAssignment from "../models/taskAssignmentModel.js";
import Inmate from "../models/inmateModel.js";

// Create Task
export const createTask = async (req, res) => {
  const { title, description, startDate, dueDate, assignedTo, assignedBy } = req.body;

  // Validation
  if (!title || !startDate || !dueDate || !assignedTo) {
    return res.status(400).json({ message: 'Title, Start Date, Due Date, and Assigned To are required' });
  }
  if (new Date(dueDate) < new Date(startDate)) {
    return res.status(400).json({ message: 'Due Date cannot be before Start Date' });
  }

  try {
    // Validate that each inmate exists
    const inmates = await Inmate.find({ _id: { $in: assignedTo } });
    if (inmates.length !== assignedTo.length) {
      return res.status(404).json({ message: 'One or more assigned inmates not found' });
    }

    // Create Task
    const task = new Tasks({
      title,
      description,
      startDate,
      dueDate,
      assignedBy,
    });

    await task.save();

    // Assign inmates to the task (create TaskAssignment entries)
    await Promise.all(
      assignedTo.map(async (inmateId) => {
        const taskAssignment = new TaskAssignment({
          taskId: task._id,
          inmateId,
          completionStatus: false,
        });
        await taskAssignment.save();
      })
    );
    

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update Task
export const updateTask = async (req, res) => {
    try {
      
      const { title, description, startDate, dueDate } = req.body;
  
      if (dueDate && new Date(dueDate) < new Date(startDate)) {
        return res.status(400).json({ message: 'Due Date cannot be before Start Date' });
      }
  
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (startDate !== undefined) updateData.startDate = startDate;
      if (dueDate !== undefined) updateData.dueDate = dueDate;
  
      const updatedTask = await Tasks.findByIdAndUpdate(req.params.id, updateData, { new: true });
  
      if (!updatedTask) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      res.status(200).json({ message: 'Task updated successfully', updatedTask });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  // Delete Task
export const deleteTask = async (req, res) => {
    const { id } = req.params;
  
    try {
      // Delete the task
      const task = await Tasks.findByIdAndDelete(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      // Delete related TaskAssignment entries
      await TaskAssignment.deleteMany({ taskId: id });
  
      res.status(200).json({ message: 'Task and related assignments deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  // List all tasks with assigned inmates
export const listTasks = async (req, res) => {
  try {
    const tasks = await Tasks.find();

    // Fetch assignments and populate inmate names for each task
    const tasksWithAssignments = await Promise.all(
      tasks.map(async (task) => {
        const assignments = await TaskAssignment.find({ taskId: task._id })
          .populate('inmateId', 'firstName lastName');
        return { ...task.toObject(), assignments };
      })
    );

    res.status(200).json(tasksWithAssignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Retrieve Individual Task with assigned inmates
export const getTaskById = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Tasks.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Fetch the task's assignments
    const assignments = await TaskAssignment.find({ taskId: id })
      .populate('inmateId', 'firstName lastName');

    // Combine task and assignments into a single response
    const taskWithAssignments = {
      ...task.toObject(), // Convert task to plain object
      assignments,        // Add assignments array to the task object
    };

    res.status(200).json(taskWithAssignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// List Tasks by Filter Parameters. This API can be used to send filter param and fetch tasks accordingly
export const listTasksByParam = async (req, res) => {
  const { title, assignedTo, status, dueDate, startDate } = req.query;

  const filter = {};

  if (title) {
    filter.title = new RegExp(title, 'i'); // Case-insensitive search for task title
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
      const taskAssignments = await TaskAssignment.find({ inmateId: assignedTo });
      const taskIds = taskAssignments.map(assignment => assignment.taskId.toString());
      filteredTasks = tasks.filter(task => taskIds.includes(task._id.toString()));
    }

    res.status(200).json(filteredTasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Close Task and Update Progress Report
export const closeTask = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the task by its ID
    const task = await Tasks.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Mark the task as Completed and set the endDate
    task.status = 'Completed';
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
      await assignment.save();  // Save the updated TaskAssignment
    });

    res.status(200).json({ message: 'Task closed and progress report updated successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get Overdue Tasks
export const getOverdueTasks = async (req, res) => {
  try {
    const overdueTasks = await Tasks.find({
      dueDate: { $lt: new Date() },  // Due date is in the past
      status: { $ne: 'Completed' },  // Task is not completed
    });

    res.status(200).json(overdueTasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
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

