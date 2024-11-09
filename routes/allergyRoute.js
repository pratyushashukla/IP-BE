import express from 'express';
import * as allergyController from '../controllers/allergyController.js';

const router = express.Router();

// Create new allergy
router.post('/', allergyController.createAllergy);

// List all allergies
router.get('/', allergyController.getAllAllergiesWithPagination);

// Get allergy by ID
router.get('/:id', allergyController.getAllergyById);

// Update allergy by ID
router.patch('/:id', allergyController.updateAllergy);

// Delete allergy by ID
router.delete('/:id', allergyController.deleteAllergy);

export default router;
