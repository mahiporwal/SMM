/**
 * ROUTES - Admin
 */

const express = require('express');
const AdminController = require('../controllers/AdminController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication AND admin role
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// Apply both middlewares to all routes
router.use(authMiddleware);
router.use(adminOnly);

// User management
router.get('/users', AdminController.getAllUsers);
router.put('/users/role', AdminController.updateUserRole);
router.post('/users/credits', AdminController.addUserCredits);

// Order management
router.get('/orders', AdminController.getAllOrders);

// System stats
router.get('/stats', AdminController.getSystemStats);

// Settings
router.get('/settings', AdminController.getSettings);
router.put('/settings', AdminController.updateSettings);

module.exports = router;