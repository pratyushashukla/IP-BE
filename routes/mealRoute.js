import express from 'express';
import * as mealController from '../controllers/mealController.js';

const router = express.Router();

// Create meal plan
router.post('/', mealController.addMealPlan);

// List all meal plans with pagination
router.get('/', mealController.listMealsWithPagination);

// Search meal plans by filters (inmateName, date, mealType)
router.get('/search', mealController.searchMealsWithPagination);

// Get meal plan by ID
router.get('/:id', mealController.getMealById);

// Update meal plan
router.patch('/:id', mealController.updateMealPlan);

// Delete meal plan
router.delete('/:id', mealController.deleteMealPlan);

// Download meal plan as PDF
router.get('/:id/download', mealController.downloadMeal);

// Email meal plan as PDF
router.post('/:id/email', mealController.emailMealPlan);

export default router;
