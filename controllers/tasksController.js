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