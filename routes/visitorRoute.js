import express from 'express';
import * as visitorController from '../controllers/visitorController.js';
import { clearRedixCache, saveDataToRedis, sendDataFromRedis } from '../lib/redis.js';

const router = express.Router();
const cacheKey = "/visitors"

// Create visitor
router.post('/', clearRedixCache(cacheKey), visitorController.addVisitor);

// List all visitors
router.get('/', saveDataToRedis(), sendDataFromRedis, visitorController.listVisitors);

// Search Visitor
router.get('/search', visitorController.searchVisitors);

// Get visitor by ID
router.get('/:id', visitorController.getVisitorById);

//Update visitor
router.patch('/:id', clearRedixCache(cacheKey), visitorController.updateVisitor);

//Delete visitor
router.delete('/:id', clearRedixCache(cacheKey), visitorController.deleteVisitor);

export default router;
