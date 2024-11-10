import express from 'express';
import * as mealController from '../controllers/mealController.js';
import { clearRedixCache, saveDataToRedis, sendDataFromRedis } from '../lib/redis.js';

const router = express.Router();
const cacheKey = "/meals"

// Create meal plan
router.post('/', clearRedixCache(cacheKey), mealController.addMealPlan);

// List all meal plans
router.get('/', saveDataToRedis(), sendDataFromRedis, mealController.listMeals);

// List all meal plans with pagination
//router.get('/', mealController.listMealsWithPagination);

// Search meal plans by filters (inmateName, date, mealType)
router.get('/search', mealController.searchMealsWithPagination);

// Get meal plan by ID
router.get('/:id', mealController.getMealById);

// Update meal plan
router.patch('/:id', clearRedixCache(cacheKey), mealController.updateMealPlan);

// Delete meal plan
router.delete('/:id', clearRedixCache(cacheKey), mealController.deleteMealPlan);

// Download meal plan as PDF
router.get('/:id/download', mealController.downloadMeal);

// Email meal plan as PDF
router.post('/:id/email', clearRedixCache(cacheKey), mealController.emailMealPlan);

export default router;
