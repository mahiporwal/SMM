/**
 * PRICING SYSTEM
 * Calculates costs based on provider rates and quantities
 */

class PricingSystem {
  /**
   * Calculate total price for an order
   * @param {Object} engagement - Engagement object {views, likes, comments, etc}
   * @param {Array} providers - Available providers with rates
   * @param {Object} discounts - Discount configuration
   * @returns {Object} Pricing details
   */
  static calculateOrderPrice(engagement, providers, discounts = {}) {
    let totalCost = 0;
    const breakdown = {};

    // Calculate cost for each metric
    Object.keys(engagement).forEach(metric => {
      if (engagement[metric] > 0) {
        const cost = this._calculateMetricCost(
          metric,
          engagement[metric],
          providers
        );
        breakdown[metric] = cost;
        totalCost += cost;
      }
    });

    // Apply discounts
    const discount = this._applyDiscounts(totalCost, discounts);
    const finalPrice = totalCost - discount.amount;

    return {
      breakdown,
      basePrice: totalCost,
      discountPercent: discount.percent,
      discountAmount: discount.amount,
      totalPrice: Math.max(finalPrice, 0),
    };
  }

  /**
   * Calculate cost for a single metric
   * @param {String} metric - Type of engagement
   * @param {Number} quantity - Total quantity
   * @param {Array} providers - Available providers
   * @returns {Number} Cost for this metric
   */
  static _calculateMetricCost(metric, quantity, providers) {
    // Find cheapest provider for this metric
    const cheapestRate = this._findCheapestRate(metric, providers);
    
    if (!cheapestRate) {
      console.warn(`No provider found for metric: ${metric}`);
      return 0;
    }

    // Price calculation: (quantity / 1000) * ratePerK
    const costPerK = cheapestRate.pricePerK;
    const cost = (quantity / 1000) * costPerK;

    return Math.round(cost * 100) / 100; // Round to 2 decimals
  }

  /**
   * Find cheapest rate for a metric
   * @param {String} metric - Metric type
   * @param {Array} providers - Provider list
   * @returns {Object} Cheapest provider rate
   */
  static _findCheapestRate(metric, providers) {
    const availableRates = providers
      .filter(p => p.status === 'active')
      .flatMap(p => 
        p.services
          .filter(s => s.metric === metric)
          .map(s => ({
            ...s,
            provider: p.panelName,
            providerId: p._id,
          }))
      )
      .sort((a, b) => a.pricePerK - b.pricePerK);

    return availableRates[0] || null;
  }

  /**
   * Apply discounts
   * @param {Number} basePrice - Base price before discount
   * @param {Object} discounts - Discount config
   * @returns {Object} Discount info
   */
  static _applyDiscounts(basePrice, discounts) {
    let discountPercent = 0;

    // Volume discount
    if (discounts.volumeDiscount) {
      if (basePrice > 5000) discountPercent += 10;
      else if (basePrice > 1000) discountPercent += 5;
      else if (basePrice > 500) discountPercent += 2;
    }

    // Promo code
    if (discounts.promoPercent) {
      discountPercent += discounts.promoPercent;
    }

    // Loyalty discount
    if (discounts.loyaltyPercent) {
      discountPercent += discounts.loyaltyPercent;
    }

    // Cap discount at 50%
    discountPercent = Math.min(discountPercent, 50);

    const discountAmount = (basePrice * discountPercent) / 100;

    return {
      percent: discountPercent,
      amount: Math.round(discountAmount * 100) / 100,
    };
  }

  /**
   * Estimate price in real-time as user inputs
   * @param {Object} engagement - Current engagement input
   * @param {Array} providers - Active providers
   * @returns {Object} Real-time pricing
   */
  static estimatePrice(engagement, providers) {
    return this.calculateOrderPrice(engagement, providers);
  }

  /**
   * Get pricing breakdown per metric
   * @param {Object} engagement - Engagement object
   * @param {Array} providers - Providers
   * @returns {Array} Pricing breakdown
   */
  static getPricingBreakdown(engagement, providers) {
    const breakdown = [];

    Object.keys(engagement).forEach(metric => {
      if (engagement[metric] > 0) {
        const cheapestRate = this._findCheapestRate(metric, providers);
        
        if (cheapestRate) {
          const cost = (engagement[metric] / 1000) * cheapestRate.pricePerK;
          breakdown.push({
            metric,
            quantity: engagement[metric],
            provider: cheapestRate.provider,
            ratePerK: cheapestRate.pricePerK,
            totalCost: Math.round(cost * 100) / 100,
          });
        }
      }
    });

    return breakdown;
  }
}

module.exports = PricingSystem;
