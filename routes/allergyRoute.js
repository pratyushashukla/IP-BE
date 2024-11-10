import express from 'express';
import * as allergyController from '../controllers/allergyController.js';
import { clearRedixCache, saveDataToRedis, sendDataFromRedis } from '../lib/redis.js';

const router = express.Router();
const cacheKey = "/allergies"

// Create new allergy
router.post('/', clearRedixCache(cacheKey), allergyController.createAllergy);

// List all allergies
router.get('/', saveDataToRedis(), sendDataFromRedis, allergyController.getAllAllergies);

// Get allergy by ID
router.get('/:id', allergyController.getAllergyById);

// Update allergy by ID
router.patch('/:id', clearRedixCache(cacheKey), allergyController.updateAllergy);

// Delete allergy by ID
router.delete('/:id', clearRedixCache(cacheKey), allergyController.deleteAllergy);

export default router;
