/**
 * ROUTES - Orders
 */

const express = require('express');
const OrderController = require('../controllers/OrderController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All order routes require authentication
router.use(authMiddleware);

// Create order
router.post('/create', OrderController.createOrder);

// Get user's orders
router.get('/', OrderController.getUserOrders);

// Get specific order
router.get('/:id', OrderController.getOrder);

// Auto-suggest engagement
router.post('/auto-suggest', OrderController.autoSuggest);

// Calculate price
router.post('/calculate-price', OrderController.calculatePrice);

// Get safety score
router.get('/:id/safety-score', OrderController.getSafetyScore);

// Cancel order
router.post('/:id/cancel', OrderController.cancelOrder);

// Get statistics
router.get('/stats/summary', OrderController.getStats);

module.exports = router;
