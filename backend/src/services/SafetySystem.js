/**
 * SAFETY SCORE SYSTEM
 * Calculates safety score based on delivery patterns
 * Prevents detection by Instagram/YouTube algorithms
 */

class SafetySystem {
  /**
   * Calculate overall safety score
   * @param {Object} orderData - Order details
   * @returns {Number} Safety score 0-100
   */
  static calculateSafetyScore(orderData) {
    const speedScore = this._calculateSpeedScore(orderData);
    const ratioScore = this._calculateRatioScore(orderData);
    const patternScore = this._calculatePatternRandomness(orderData);
    const behaviorScore = this._calculateBehaviorScore(orderData);

    // Weighted average
    const score = (
      (speedScore * 0.3) +
      (ratioScore * 0.3) +
      (patternScore * 0.25) +
      (behaviorScore * 0.15)
    );

    return Math.round(score);
  }

  /**
   * Calculate speed score (slower = safer)
   * @param {Object} orderData - Order details
   * @returns {Number} 0-100
   */
  static _calculateSpeedScore(orderData) {
    const { duration, engagement } = orderData;
    const totalEngagement = Object.values(engagement).reduce((a, b) => a + b, 0);
    
    // Engagements per hour
    const engagementPerHour = totalEngagement / duration;

    if (engagementPerHour > 100000) return 20; // Very risky
    if (engagementPerHour > 50000) return 40;
    if (engagementPerHour > 20000) return 60;
    if (engagementPerHour > 10000) return 80;
    return 100; // Safe
  }

  /**
   * Calculate ratio score (realistic ratios = safer)
   * @param {Object} orderData - Order details
   * @returns {Number} 0-100
   */
  static _calculateRatioScore(orderData) {
    const { engagement } = orderData;
    const views = engagement.views || 1;

    // Calculate percentages
    const likesPercent = (engagement.likes / views) * 100;
    const commentsPercent = (engagement.comments / views) * 100;
    const sharesPercent = (engagement.shares / views) * 100;
    const savesPercent = (engagement.saves / views) * 100;

    let score = 100;

    // Likes ratio check: should be 1-15%
    if (likesPercent > 20 || likesPercent < 0.5) score -= 20;
    else if (likesPercent > 15) score -= 10;

    // Comments ratio check: should be 0.2-2%
    if (commentsPercent > 3 || (commentsPercent > 0 && commentsPercent < 0.1)) score -= 15;
    else if (commentsPercent > 2) score -= 8;

    // Shares ratio check: should be 0.5-3%
    if (sharesPercent > 5) score -= 15;
    else if (sharesPercent > 3) score -= 8;

    // Saves ratio check: should be 0.5-5%
    if (savesPercent > 8) score -= 10;

    return Math.max(score, 20);
  }

  /**
   * Calculate pattern randomness score
   * More randomness = safer
   * @param {Object} orderData - Order details
   * @returns {Number} 0-100
   */
  static _calculatePatternRandomness(orderData) {
    const { deliveryLog } = orderData;

    if (!deliveryLog || deliveryLog.length < 2) return 50;

    // Calculate coefficient of variation for delivery amounts
    const amounts = deliveryLog.map(d => d.viewsAdded || 0);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = (stdDev / (mean || 1)) * 100;

    // Higher coefficient = more randomness = safer
    if (coefficientOfVariation > 60) return 100;
    if (coefficientOfVariation > 40) return 85;
    if (coefficientOfVariation > 20) return 70;
    if (coefficientOfVariation > 10) return 50;
    return 30; // Too consistent = risky
  }

  /**
   * Calculate behavior score based on timing and patterns
   * @param {Object} orderData - Order details
   * @returns {Number} 0-100
   */
  static _calculateBehaviorScore(orderData) {
    const { deliveryLog } = orderData;

    if (!deliveryLog || deliveryLog.length < 2) return 50;

    let score = 100;

    // Check for uniform delivery intervals (bad)
    const intervals = [];
    for (let i = 1; i < deliveryLog.length; i++) {
      const timeDiff = new Date(deliveryLog[i].timestamp) - new Date(deliveryLog[i-1].timestamp);
      intervals.push(timeDiff);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const intervalVariance = intervals.map(i => Math.pow(i - avgInterval, 2));
    const intervalStdDev = Math.sqrt(intervalVariance.reduce((a, b) => a + b, 0) / intervalVariance.length);

    // Too consistent intervals
    if (intervalStdDev < avgInterval * 0.1) score -= 30;

    // Check for time-based activity (good - natural pattern)
    const nightTime = deliveryLog.filter(d => {
      const hour = new Date(d.timestamp).getHours();
      return hour >= 22 || hour < 6;
    }).length;

    if (nightTime > deliveryLog.length * 0.3) score += 10; // Night activity exists

    return Math.max(score, 30);
  }

  /**
   * Get risk level based on score
   * @param {Number} score - Safety score
   * @returns {String} Risk level
   */
  static getRiskLevel(score) {
    if (score >= 85) return 'very-safe';
    if (score >= 70) return 'safe';
    if (score >= 50) return 'medium';
    if (score >= 30) return 'risky';
    return 'very-risky';
  }

  /**
   * Get recommendations based on safety score
   * @param {Number} score - Safety score
   * @returns {Array} Array of recommendations
   */
  static getRecommendations(score) {
    const recommendations = [];

    if (score < 30) {
      recommendations.push('⚠️ Order has high detection risk. Consider increasing duration.');
      recommendations.push('💡 Add more time between cycles (increase duration).');
      recommendations.push('🎲 Increase randomization in delivery pattern.');
    } else if (score < 50) {
      recommendations.push('⚠️ Order has medium detection risk.');
      recommendations.push('💡 Consider adding slight delays between engagement types.');
    } else if (score < 70) {
      recommendations.push('✅ Order is reasonably safe.');
      recommendations.push('💡 Delivery pattern looks natural.');
    } else {
      recommendations.push('✅ Order is very safe with natural delivery pattern.');
      recommendations.push('📊 Excellent randomization and timing.');
    }

    return recommendations;
  }
}

module.exports = SafetySystem;
