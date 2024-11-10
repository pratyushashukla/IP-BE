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
import { clearRedixCache, saveDataToRedis, sendDataFromRedis } from '../lib/redis.js';

const router = express.Router();
const cacheKey = "/tasks"

// Create task
router.post('/', clearRedixCache(cacheKey), createTask);

//Update Task
router.patch('/:id', clearRedixCache(cacheKey), updateTask);

//Delete Task
router.delete('/:id', clearRedixCache(cacheKey), deleteTask);

// List all tasks
router.get('/', saveDataToRedis(), sendDataFromRedis, listTasks);

// Get task by ID
router.get('/:id', getTaskById);

// List tasks by parameters 
router.get('/filter', listTasksByParam);

// Close a task
router.patch('/:id/close', clearRedixCache(cacheKey), closeTask);

// Get overdue tasks
router.get('/overdue', getOverdueTasks);

//Update Task Status
router.patch('/:id/status', clearRedixCache(cacheKey), updateTaskStatus);

// Assign task to inmate(s) 
router.patch('/:id/assign', clearRedixCache(cacheKey), assignTaskToInmates);

export default router;
