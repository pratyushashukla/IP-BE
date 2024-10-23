import express from 'express';
import {
  createInmate,
  getAllInmates,
  getInmateById,
  updateInmate,
  deleteInmate
} from '../controllers/inmateController.js';

// import * as inmateController from "../controllers/inmateController.js"; // This was giving error so used above individual routes

const router = express.Router();

// Create inmate
router.post('/', createInmate);

// Get all inmates
router.get('/', getAllInmates);

// Get inmate by ID
router.get('/:id', getInmateById);

// Update inmate (using PATCH)
router.patch('/:id', updateInmate);

// Delete inmate
router.delete('/:id', deleteInmate);

export default router;
