import express from 'express';
import {
    createTask,
    updateTask,
    deleteTask,
  } from '../controllers/tasksController.js';

const router = express.Router();

// Create task
router.post('/', createTask);

//Update Task
router.patch('/:id', updateTask);

//Delete Task
router.delete('/:id', deleteTask);
