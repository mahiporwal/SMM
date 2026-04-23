/**
 * ROUTES - Auth
 */

const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// Registration and login do not require auth middleware
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

module.exports = router;
