/**
 * WALLET CONTROLLER
 * Handles wallet-related HTTP requests
 */

const WalletService = require('../services/WalletService');

class WalletController {
  /**
   * GET /api/wallet
   * Get user's wallet
   */
  static async getWallet(req, res) {
    try {
      const userId = req.user._id;
      const wallet = await WalletService.getWallet(userId);

      res.json({
        success: true,
        wallet,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/wallet/deposit
   * Add funds to wallet
   */
  static async deposit(req, res) {
    try {
      const userId = req.user._id;
      const { amount, method = 'card', reference = '' } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid amount',
        });
      }

      const result = await WalletService.deposit(userId, amount, method, reference);

      res.json({
        success: true,
        message: 'Deposit successful',
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/wallet/transactions
   * Get transaction history
   */
  static async getTransactions(req, res) {
    try {
      const userId = req.user._id;
      const { limit = 10, page = 1 } = req.query;

      const skip = (page - 1) * limit;
      const result = await WalletService.getTransactionHistory(userId, limit, skip);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/wallet/summary
   * Get wallet summary
   */
  static async getSummary(req, res) {
    try {
      const userId = req.user._id;
      const summary = await WalletService.getWalletSummary(userId);

      res.json({
        success: true,
        summary,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = WalletController;
