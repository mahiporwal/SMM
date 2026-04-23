/**
 * ADMIN CONTROLLER
 * Admin-only features for managing the SMM panel
 */

const User = require('../models/User');
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

class AdminController {
  // Get all users
  static async getAllUsers(req, res, next) {
    try {
      const users = await User.find({})
        .select('-password')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        users,
        total: users.length
      });
    } catch (err) {
      next(err);
    }
  }

  // Get all orders
  static async getAllOrders(req, res, next) {
    try {
      const orders = await Order.find({})
        .populate('userId', 'username email')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        orders,
        total: orders.length
      });
    } catch (err) {
      next(err);
    }
  }

  // Get system statistics
  static async getSystemStats(req, res, next) {
    try {
      const totalUsers = await User.countDocuments();
      const totalOrders = await Order.countDocuments();
      const completedOrders = await Order.countDocuments({ status: 'completed' });
      const pendingOrders = await Order.countDocuments({ status: 'pending' });
      const totalRevenue = await Transaction.aggregate([
        { $match: { type: 'payment' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const recentOrders = await Order.find({})
        .populate('userId', 'username')
        .sort({ createdAt: -1 })
        .limit(10);

      res.json({
        success: true,
        stats: {
          totalUsers,
          totalOrders,
          completedOrders,
          pendingOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          completionRate: totalOrders > 0 ? (completedOrders / totalOrders * 100).toFixed(1) : 0
        },
        recentOrders
      });
    } catch (err) {
      next(err);
    }
  }

  // Update user role
  static async updateUserRole(req, res, next) {
    try {
      const { userId, role } = req.body;

      if (!['user', 'admin', 'provider'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role'
        });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        user,
        message: `User role updated to ${role}`
      });
    } catch (err) {
      next(err);
    }
  }

  // Add credits to user wallet (admin only)
  static async addUserCredits(req, res, next) {
    try {
      const { userId, amount, reason } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        return res.status(404).json({
          success: false,
          error: 'Wallet not found'
        });
      }

      // Create admin credit transaction
      const transaction = new Transaction({
        userId,
        walletId: wallet._id,
        type: 'admin-credit',
        amount,
        status: 'completed',
        description: reason || 'Admin credit'
      });

      await transaction.save();

      wallet.balance += amount;
      wallet.transactions.push(transaction._id);
      await wallet.save();

      res.json({
        success: true,
        message: `Added ₹${amount} to ${user.username}'s wallet`,
        newBalance: wallet.balance
      });
    } catch (err) {
      next(err);
    }
  }

  // Get system settings
  static async getSettings(req, res, next) {
    try {
      // In a real app, you'd have a Settings model
      const settings = {
        systemName: 'SMM Panel',
        maintenanceMode: false,
        maxOrdersPerUser: 10,
        defaultCurrency: 'INR',
        supportEmail: 'support@smm-panel.com',
        telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
        telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
        emailNotifications: true,
        smsNotifications: false
      };

      res.json({
        success: true,
        settings
      });
    } catch (err) {
      next(err);
    }
  }

  // Update system settings
  static async updateSettings(req, res, next) {
    try {
      const settings = req.body;

      // In a real app, save to database
      // For now, just return success

      res.json({
        success: true,
        message: 'Settings updated successfully',
        settings
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AdminController;