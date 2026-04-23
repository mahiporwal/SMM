/**
 * AUTO SUGGEST ENGINE
 * Suggests natural engagement ratios based on views
 */

class AutoSuggestEngine {
  /**
   * Default engagement ratios (as percentages)
   * These are BASE values - actual will vary
   */
  static getDefaultRatios() {
    return {
      likes: { min: 2, max: 8 }, // 2-8% of views
      comments: { min: 0.2, max: 1 }, // 0.2-1% of views
      shares: { min: 0.5, max: 2 }, // 0.5-2% of views
      saves: { min: 0.5, max: 3 }, // 0.5-3% of views
    };
  }

  /**
   * Generate auto suggestions based on views
   * @param {Number} views - Number of views
   * @param {Object} customRatios - Optional custom ratios
   * @returns {Object} Suggested engagement metrics
   */
  static generateSuggestions(views, customRatios = null) {
    const ratios = customRatios || this.getDefaultRatios();
    
    const suggestions = {
      views: views,
      likes: this._calculateMetric(views, ratios.likes),
      comments: this._calculateMetric(views, ratios.comments),
      shares: this._calculateMetric(views, ratios.shares),
      saves: this._calculateMetric(views, ratios.saves),
    };

    return suggestions;
  }

  /**
   * Calculate metric with randomization
   * @param {Number} baseValue - Base value (e.g., total views)
   * @param {Object} range - {min: x, max: y} percentage range
   * @returns {Number} Calculated metric value
   */
  static _calculateMetric(baseValue, range) {
    // Random percentage within range
    const percentage = Math.random() * (range.max - range.min) + range.min;
    
    // Calculate value
    let metric = Math.floor(baseValue * (percentage / 100));
    
    // Add slight randomization: ±10% variation
    const variation = metric * (0.9 + Math.random() * 0.2);
    metric = Math.round(variation);
    
    return Math.max(metric, 0);
  }

  /**
   * Get variation ratio for natural behavior
   * Each order should have slightly different ratios
   * @returns {Object} Variation multipliers
   */
  static getVariationRatio() {
    return {
      likes: 0.9 + Math.random() * 0.2, // 0.9 to 1.1
      comments: 0.8 + Math.random() * 0.4, // 0.8 to 1.2
      shares: 0.7 + Math.random() * 0.6, // 0.7 to 1.3
      saves: 0.9 + Math.random() * 0.2, // 0.9 to 1.1
    };
  }

  /**
   * Analyze content type and suggest adjusted ratios
   * Different content types have different engagement patterns
   * @param {String} contentType - 'reel', 'carousel', 'post', 'story', 'video'
   * @returns {Object} Adjusted ratios
   */
  static suggestByContentType(contentType) {
    const baseRatios = this.getDefaultRatios();
    
    switch(contentType.toLowerCase()) {
      case 'reel':
      case 'video':
        // Videos get higher engagement
        return {
          likes: { min: 3, max: 12 },
          comments: { min: 0.5, max: 2 },
          shares: { min: 1, max: 3 },
          saves: { min: 1, max: 4 },
        };
      
      case 'carousel':
        // Carousels get good shares
        return {
          likes: { min: 4, max: 10 },
          comments: { min: 0.3, max: 1.5 },
          shares: { min: 1, max: 4 },
          saves: { min: 1, max: 3 },
        };
      
      case 'story':
        // Stories have different engagement
        return {
          likes: { min: 5, max: 15 },
          comments: { min: 0.1, max: 0.5 },
          shares: { min: 0.2, max: 1 },
          saves: { min: 0.1, max: 0.5 },
        };
      
      default:
        return baseRatios;
    }
  }

  /**
   * Suggest based on account age/followers
   * New accounts need lower ratios
   * @param {Number} accountFollowers - Account follower count
   * @returns {Object} Adjusted ratios
   */
  static suggestByAccountSize(accountFollowers) {
    const baseRatios = this.getDefaultRatios();
    
    if (accountFollowers < 1000) {
      // Micro accounts - higher engagement %
      return {
        likes: { min: 5, max: 15 },
        comments: { min: 0.5, max: 2 },
        shares: { min: 1, max: 3 },
        saves: { min: 1, max: 4 },
      };
    } else if (accountFollowers < 100000) {
      // Small to medium accounts
      return baseRatios;
    } else {
      // Large accounts - lower engagement %
      return {
        likes: { min: 0.5, max: 3 },
        comments: { min: 0.05, max: 0.3 },
        shares: { min: 0.1, max: 0.5 },
        saves: { min: 0.2, max: 1 },
      };
    }
  }
}

module.exports = AutoSuggestEngine;
