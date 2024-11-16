import express from 'express';
import {
  createInmate,
  getAllInmates,
  getInmateById,
  updateInmate,
  deleteInmate
} from '../controllers/inmateController.js';
import { clearRedixCache, saveDataToRedis, sendDataFromRedis } from '../lib/redis.js';

// import * as inmateController from "../controllers/inmateController.js"; // This was giving error so used above individual routes

const router = express.Router();
const cacheKey = "/inmates"

// Create inmate
router.post('/', clearRedixCache(cacheKey), createInmate);

// Get all inmates
router.get('/', saveDataToRedis(), sendDataFromRedis, getAllInmates);

// Get inmate by ID
router.get('/:id', getInmateById);

// Update inmate (using PATCH)
router.patch('/:id', clearRedixCache(cacheKey), updateInmate);

// Soft delete inmate (mark as inactive)
router.delete('/:id', clearRedixCache(cacheKey), deleteInmate);

export default router;
