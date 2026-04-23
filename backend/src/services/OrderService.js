/**
 * ORDER SERVICE
 * Manages order lifecycle
 */

const Order = require('../models/Order');
const DeliveryEngine = require('./DeliveryEngine');
const PricingSystem = require('./PricingSystem');
const AutoSuggestEngine = require('./AutoSuggestEngine');
const SafetySystem = require('./SafetySystem');

class OrderService {
  /**
   * Create new order
   * @param {Object} orderData - Order input
   * @param {String} userId - User ID
   * @returns {Object} Created order
   */
  static async createOrder(orderData, userId) {
    const {
      platform,
      contentUrl,
      orderType,
      engagement,
      duration,
      autoSuggest = true,
    } = orderData;

    let finalEngagement = { ...engagement };

    // Apply auto-suggest if enabled
    if (autoSuggest && engagement.views) {
      const suggestions = AutoSuggestEngine.generateSuggestions(engagement.views);
      const variation = AutoSuggestEngine.getVariationRatio();

      finalEngagement = {
        views: engagement.views,
        likes: Math.round(suggestions.likes * variation.likes),
        comments: Math.round(suggestions.comments * variation.comments),
        shares: Math.round(suggestions.shares * variation.shares),
        saves: Math.round(suggestions.saves * variation.saves),
      };
    }

    // Calculate delivery cycles
    const cycles = DeliveryEngine.calculateDeliveryCycles(
      finalEngagement.views,
      duration
    );

    // Generate delivery pattern
    const pattern = DeliveryEngine.generateDeliveryPattern(cycles.length);

    // Calculate pricing
    // Note: providers would be fetched from DB in real implementation
    const mockProviders = [];
    const pricing = PricingSystem.calculateOrderPrice(
      finalEngagement,
      mockProviders
    );

    // Create order
    const order = new Order({
      userId,
      platform,
      contentUrl,
      orderType,
      engagement: finalEngagement,
      autoSuggestedEngagement: finalEngagement,
      duration,
      deliveryMode: 'gradual',
      pricing,
      status: 'pending',
      safetyInfo: {
        speed: SafetySystem._calculateSpeedScore({ duration, engagement: finalEngagement }),
        ratio: SafetySystem._calculateRatioScore({ engagement: finalEngagement }),
        patternRandomness: 80,
        overallSafetyScore: SafetySystem.calculateSafetyScore({
          duration,
          engagement: finalEngagement,
        }),
      },
    });

    await order.save();

    return {
      _id: order._id,
      ...order.toObject(),
      deliveryCycles: cycles,
      deliveryPattern: pattern,
    };
  }

  /**
   * Get order details
   * @param {String} orderId - Order ID
   * @returns {Object} Order details
   */
  static async getOrder(orderId) {
    const order = await Order.findById(orderId)
      .populate('userId', 'username email')
      .populate('parentProviderId', 'panelName');

    return order;
  }

  /**
   * Get user's orders
   * @param {String} userId - User ID
   * @param {Number} limit - Results limit
   * @param {Number} skip - Skip count
   * @returns {Array} Orders
   */
  static async getUserOrders(userId, limit = 10, skip = 0) {
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments({ userId });

    return {
      orders,
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Update order status
   * @param {String} orderId - Order ID
   * @param {String} newStatus - New status
   * @returns {Object} Updated order
   */
  static async updateOrderStatus(orderId, newStatus) {
    const validStatuses = ['pending', 'processing', 'delivering', 'completed', 'failed', 'cancelled'];
    
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: newStatus,
        startedAt: newStatus === 'processing' ? new Date() : undefined,
        completedAt: newStatus === 'completed' ? new Date() : undefined,
      },
      { new: true }
    );

    return order;
  }

  /**
   * Add delivery log entry
   * @param {String} orderId - Order ID
   * @param {Object} deliveryData - Delivery info
   * @returns {Object} Updated order
   */
  static async addDeliveryLog(orderId, deliveryData) {
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        $push: {
          deliveryLog: {
            timestamp: new Date(),
            ...deliveryData,
          },
        },
        deliveryProgress: deliveryData.progressPercent || 0,
      },
      { new: true }
    );

    return order;
  }

  /**
   * Cancel order
   * @param {String} orderId - Order ID
   * @param {String} reason - Cancellation reason
   * @returns {Object} Cancelled order
   */
  static async cancelOrder(orderId, reason) {
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: 'cancelled',
        cancelReason: reason,
      },
      { new: true }
    );

    return order;
  }

  /**
   * Get order statistics
   * @param {String} userId - User ID
   * @returns {Object} Statistics
   */
  static async getOrderStats(userId) {
    const orders = await Order.find({ userId });

    const stats = {
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      failedOrders: orders.filter(o => o.status === 'failed').length,
      totalViewsDelivered: 0,
      totalLikesDelivered: 0,
      averageSafetyScore: 0,
    };

    orders.forEach(order => {
      const log = order.deliveryLog || [];
      stats.totalViewsDelivered += log.reduce((sum, d) => sum + (d.viewsAdded || 0), 0);
      stats.totalLikesDelivered += log.reduce((sum, d) => sum + (d.likesAdded || 0), 0);
    });

    const avgSafety = orders.reduce((sum, o) => sum + (o.safetyInfo?.overallSafetyScore || 0), 0);
    stats.averageSafetyScore = Math.round(avgSafety / (orders.length || 1));

    return stats;
  }
}

module.exports = OrderService;
