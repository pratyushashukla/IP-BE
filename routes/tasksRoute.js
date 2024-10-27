import express from 'express';
import {
    createTask,
    updateTask,
    deleteTask,
    listTasks,
    getTaskById,
    listTasksByParam,
    closeTask,
    getOverdueTasks,
    updateTaskStatus,
    assignTaskToInmates
  } from '../controllers/tasksController.js';

const router = express.Router();

// Create task
router.post('/', createTask);

//Update Task
router.patch('/:id', updateTask);

//Delete Task
router.delete('/:id', deleteTask);

// List all tasks
router.get('/', listTasks);

// Get task by ID
router.get('/:id', getTaskById);

// List tasks by parameters 
router.get('/filter', listTasksByParam);

// Close a task
router.patch('/:id/close', closeTask);

// Get overdue tasks
router.get('/overdue', getOverdueTasks);

//Update Task Status
router.patch('/:id/status', updateTaskStatus);

// Assign task to inmate(s) 
router.patch('/:id/assign', assignTaskToInmates);

export default router;
