/**
 * ROUTES - Wallet
 */

const express = require('express');
const WalletController = require('../controllers/WalletController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All wallet routes require authentication
router.use(authMiddleware);

// Get wallet
router.get('/', WalletController.getWallet);

// Deposit funds
router.post('/deposit', WalletController.deposit);

// Get transaction history
router.get('/transactions', WalletController.getTransactions);

// Get summary
router.get('/summary', WalletController.getSummary);

module.exports = router;
