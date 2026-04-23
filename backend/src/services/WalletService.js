/**
 * WALLET SERVICE
 * Manages user wallet and transactions
 */

const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

class WalletService {
  /**
   * Create wallet for new user
   * @param {String} userId - User ID
   * @returns {Object} Created wallet
   */
  static async createWallet(userId) {
    const wallet = new Wallet({
      userId,
      balance: 0,
      totalDeposited: 0,
      totalSpent: 0,
    });

    await wallet.save();
    return wallet;
  }

  /**
   * Get user's wallet
   * @param {String} userId - User ID
   * @returns {Object} Wallet
   */
  static async getWallet(userId) {
    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = await this.createWallet(userId);
    }

    return wallet;
  }

  /**
   * Add funds to wallet
   * @param {String} userId - User ID
   * @param {Number} amount - Amount to deposit
   * @param {String} method - Payment method
   * @param {String} reference - Payment reference ID
   * @returns {Object} Transaction
   */
  static async deposit(userId, amount, method = 'card', reference = '') {
    const wallet = await this.getWallet(userId);

    // Create transaction
    const transaction = new Transaction({
      userId,
      walletId: wallet._id,
      type: 'deposit',
      amount,
      paymentMethod: method,
      status: 'pending',
      reference,
    });

    await transaction.save();

    // Update wallet after payment confirmation
    // In real app, this would be updated via webhook from payment provider
    wallet.balance += amount;
    wallet.totalDeposited += amount;
    wallet.transactions.push(transaction._id);
    await wallet.save();

    transaction.status = 'completed';
    await transaction.save();

    return {
      transaction,
      newBalance: wallet.balance,
    };
  }

  /**
   * Deduct funds for order
   * @param {String} userId - User ID
   * @param {Number} amount - Amount to deduct
   * @param {String} orderId - Related order ID
   * @returns {Object} Result
   */
  static async deductForOrder(userId, amount, orderId) {
    const wallet = await this.getWallet(userId);

    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Create transaction
    const transaction = new Transaction({
      userId,
      walletId: wallet._id,
      type: 'payment',
      amount,
      status: 'completed',
      relatedOrder: orderId,
    });

    await transaction.save();

    // Update wallet
    wallet.balance -= amount;
    wallet.totalSpent += amount;
    wallet.transactions.push(transaction._id);
    await wallet.save();

    return {
      transaction,
      newBalance: wallet.balance,
    };
  }

  /**
   * Refund funds to wallet
   * @param {String} userId - User ID
   * @param {Number} amount - Refund amount
   * @param {String} reason - Refund reason
   * @param {String} orderId - Related order
   * @returns {Object} Transaction
   */
  static async refund(userId, amount, reason, orderId) {
    const wallet = await this.getWallet(userId);

    const transaction = new Transaction({
      userId,
      walletId: wallet._id,
      type: 'refund',
      amount,
      status: 'completed',
      description: reason,
      relatedOrder: orderId,
    });

    await transaction.save();

    wallet.balance += amount;
    wallet.transactions.push(transaction._id);
    await wallet.save();

    return transaction;
  }

  /**
   * Get transaction history
   * @param {String} userId - User ID
   * @param {Number} limit - Results limit
   * @param {Number} skip - Skip count
   * @returns {Array} Transactions
   */
  static async getTransactionHistory(userId, limit = 10, skip = 0) {
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Transaction.countDocuments({ userId });

    return {
      transactions,
      total,
      page: Math.floor(skip / limit) + 1,
    };
  }

  /**
   * Get wallet summary
   * @param {String} userId - User ID
   * @returns {Object} Summary
   */
  static async getWalletSummary(userId) {
    const wallet = await this.getWallet(userId);
    const user = await User.findById(userId);

    const monthlySpent = await Transaction.aggregate([
      {
        $match: {
          userId: require('mongoose').Types.ObjectId(userId),
          type: 'payment',
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    return {
      balance: wallet.balance,
      totalDeposited: wallet.totalDeposited,
      totalSpent: wallet.totalSpent,
      monthlySpent: monthlySpent[0]?.total || 0,
      transactions: wallet.transactions.length,
      user: {
        username: user.username,
        totalOrders: user.totalOrdersCount,
      },
    };
  }

  /**
   * Add admin credit (admin-only)
   * @param {String} userId - User ID
   * @param {Number} amount - Credit amount
   * @param {String} reason - Credit reason
   * @returns {Object} Transaction
   */
  static async adminCredit(userId, amount, reason = '') {
    const wallet = await this.getWallet(userId);

    const transaction = new Transaction({
      userId,
      walletId: wallet._id,
      type: 'admin-credit',
      amount,
      status: 'completed',
      description: reason || 'Admin credit',
    });

    await transaction.save();

    wallet.balance += amount;
    wallet.transactions.push(transaction._id);
    await wallet.save();

    return transaction;
  }
}

module.exports = WalletService;
