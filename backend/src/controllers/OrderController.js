/**
 * ORDER CONTROLLER
 * Handles order-related HTTP requests
 */

const OrderService = require('../services/OrderService');
const PricingSystem = require('../services/PricingSystem');
const AutoSuggestEngine = require('../services/AutoSuggestEngine');
const SafetySystem = require('../services/SafetySystem');

class OrderController {
  /**
   * POST /api/orders/create
   * Create new order
   */
  static async createOrder(req, res) {
    try {
      const userId = req.user._id;
      const orderData = req.body;

      const order = await OrderService.createOrder(orderData, userId);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/orders/:id
   * Get order details
   */
  static async getOrder(req, res) {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrder(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found',
        });
      }

      res.json({
        success: true,
        order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/orders
   * Get user's orders
   */
  static async getUserOrders(req, res) {
    try {
      const userId = req.user._id;
      const { limit = 10, page = 1 } = req.query;

      const skip = (page - 1) * limit;
      const result = await OrderService.getUserOrders(userId, limit, skip);

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
   * POST /api/orders/auto-suggest
   * Get auto-suggested engagement
   */
  static async autoSuggest(req, res) {
    try {
      const { views, contentType, accountFollowers } = req.body;

      if (!views) {
        return res.status(400).json({
          success: false,
          error: 'Views required',
        });
      }

      let suggestions = AutoSuggestEngine.generateSuggestions(views);

      if (contentType) {
        const ratios = AutoSuggestEngine.suggestByContentType(contentType);
        suggestions = AutoSuggestEngine.generateSuggestions(views, ratios);
      }

      if (accountFollowers) {
        const ratios = AutoSuggestEngine.suggestByAccountSize(accountFollowers);
        suggestions = AutoSuggestEngine.generateSuggestions(views, ratios);
      }

      res.json({
        success: true,
        suggestions,
        variation: AutoSuggestEngine.getVariationRatio(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/orders/calculate-price
   * Calculate order price
   */
  static async calculatePrice(req, res) {
    try {
      const { engagement, providers = [] } = req.body;

      const pricing = PricingSystem.calculateOrderPrice(engagement, providers);
      const breakdown = PricingSystem.getPricingBreakdown(engagement, providers);

      res.json({
        success: true,
        pricing,
        breakdown,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/orders/:id/safety-score
   * Get order safety score
   */
  static async getSafetyScore(req, res) {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrder(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found',
        });
      }

      const safetyScore = SafetySystem.calculateSafetyScore({
        duration: order.duration,
        engagement: order.engagement,
        deliveryLog: order.deliveryLog,
      });

      const riskLevel = SafetySystem.getRiskLevel(safetyScore);
      const recommendations = SafetySystem.getRecommendations(safetyScore);

      res.json({
        success: true,
        safetyScore,
        riskLevel,
        recommendations,
        details: order.safetyInfo,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/orders/:id/cancel
   * Cancel order
   */
  static async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const order = await OrderService.cancelOrder(id, reason);

      res.json({
        success: true,
        message: 'Order cancelled',
        order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/orders/stats/summary
   * Get order statistics
   */
  static async getStats(req, res) {
    try {
      const userId = req.user._id;
      const stats = await OrderService.getOrderStats(userId);

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = OrderController;
