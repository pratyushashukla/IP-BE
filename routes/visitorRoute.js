import express from 'express';
import * as visitorController from '../controllers/visitorController.js';

const router = express.Router();

// Create visitor
router.post('/', visitorController.addVisitor);

// List all visitors
router.get('/', visitorController.listVisitors);

// Search Visitor
router.get('/search', visitorController.searchVisitors);

// Get visitor by ID
router.get('/:id', visitorController.getVisitorById);

//Update visitor
router.patch('/:id', visitorController.updateVisitor);

//Delete visitor
router.delete('/:id', visitorController.deleteVisitor);

export default router;
