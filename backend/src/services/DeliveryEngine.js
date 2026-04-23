/**
 * DELIVERY ENGINE - Core Service
 * Handles gradual, staggered delivery with randomization
 */

class DeliveryEngine {
  /**
   * Calculate delivery cycles
   * @param {Number} totalQuantity - Total quantity to deliver
   * @param {Number} durationHours - Total duration in hours
   * @returns {Array} Array of delivery cycles
   */
  static calculateDeliveryCycles(totalQuantity, durationHours) {
    const totalMinutes = durationHours * 60;
    
    // Interval: random between 10-30 minutes
    const minInterval = 10;
    const maxInterval = 30;
    const averageInterval = (minInterval + maxInterval) / 2;
    
    // Calculate number of cycles
    const estimatedCycles = Math.floor(totalMinutes / averageInterval);
    const actualCycles = this._getRandomInRange(
      Math.max(estimatedCycles - 20, 50),
      Math.min(estimatedCycles + 20, 300)
    );
    
    // Distribute quantity across cycles with randomization
    const cycles = [];
    let remainingQuantity = totalQuantity;
    
    for (let i = 0; i < actualCycles; i++) {
      let cycleQuantity;
      
      if (i === actualCycles - 1) {
        // Last cycle gets remaining quantity
        cycleQuantity = remainingQuantity;
      } else {
        // Random distribution: between 1-5% of remaining for each cycle
        const percentOfRemaining = this._getRandomInRange(1, 5) / 100;
        cycleQuantity = Math.floor(remainingQuantity * percentOfRemaining);
        cycleQuantity = Math.max(cycleQuantity, Math.floor(totalQuantity / (actualCycles * 2)));
      }
      
      remainingQuantity -= cycleQuantity;
      
      // Calculate interval with randomization
      const cycleInterval = this._getRandomInRange(minInterval, maxInterval);
      
      cycles.push({
        cycleNumber: i + 1,
        quantity: cycleQuantity,
        interval: cycleInterval, // minutes
        timestamp: null, // Will be set during execution
        delivered: false,
      });
    }
    
    return cycles;
  }

  /**
   * Generate delivery pattern graph (slow start → peak → slow end)
   * @param {Number} cycles - Total number of cycles
   * @returns {Array} Array of delivery intensity percentages
   */
  static generateDeliveryPattern(cycles) {
    const pattern = [];
    
    for (let i = 0; i < cycles; i++) {
      // Normalize cycle position (0 to 1)
      const position = i / (cycles - 1 || 1);
      
      // Bell curve: slower at start and end, faster in middle
      // Using cubic easing for smooth transition
      let intensity;
      
      if (position < 0.5) {
        // First half: acceleration
        intensity = position * position * 2; // 0 to 0.5
      } else {
        // Second half: deceleration
        const secondHalf = (position - 0.5) * 2; // 0 to 1
        intensity = 0.5 + (secondHalf * (1 - secondHalf * secondHalf * 0.5)); // 0.5 to 1 to 0.5
      }
      
      // Add randomization: ±20% variation
      intensity = intensity * (0.8 + Math.random() * 0.4);
      
      pattern.push({
        cycle: i + 1,
        intensity: Math.min(intensity, 1),
      });
    }
    
    return pattern;
  }

  /**
   * Calculate per-cycle quantities based on pattern
   * @param {Number} totalQuantity - Total quantity
   * @param {Array} pattern - Delivery pattern
   * @returns {Array} Quantities per cycle
   */
  static calculateQuantitiesPerCycle(totalQuantity, pattern) {
    const intensities = pattern.map(p => p.intensity);
    const totalIntensity = intensities.reduce((a, b) => a + b, 0);
    
    return pattern.map((p, index) => ({
      cycle: index + 1,
      intensity: p.intensity,
      quantity: Math.round((p.intensity / totalIntensity) * totalQuantity),
      baseQuantity: Math.round(totalQuantity / pattern.length),
    }));
  }

  /**
   * Distribute engagement metrics across cycles
   * @param {Object} engagement - Engagement object with all metrics
   * @param {Number} cycles - Number of cycles
   * @returns {Array} Array of cycle distributions
   */
  static distributeEngagementMetrics(engagement, cycles) {
    const distribution = [];
    
    for (let cycle = 0; cycle < cycles; cycle++) {
      const cycleData = {
        cycle: cycle + 1,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        reposts: 0,
      };
      
      // Distribute each metric randomly across cycles
      Object.keys(engagement).forEach(metric => {
        if (metric === 'views' || metric === 'likes' || metric === 'comments' ||
            metric === 'shares' || metric === 'saves' || metric === 'reposts') {
          
          const totalMetric = engagement[metric];
          
          // Random percentage: 0.5% to 3% per cycle
          const percentPerCycle = this._getRandomInRange(0.5, 3) / 100;
          let cycleAmount = Math.floor(totalMetric * percentPerCycle);
          
          // Ensure at least 1 if metric > 0
          if (totalMetric > 0) {
            cycleAmount = Math.max(cycleAmount, 1);
          }
          
          cycleData[metric] = cycleAmount;
        }
      });
      
      distribution.push(cycleData);
    }
    
    return distribution;
  }

  /**
   * Simulate delay logic for engagement
   * Views start immediately, likes delayed, comments even more delayed
   * @param {Array} cycles - Delivery cycles
   * @returns {Object} Delay configuration per metric
   */
  static generateEngagementDelayLogic(cycles) {
    const totalMinutes = cycles.reduce((sum, c) => sum + c.interval, 0);
    
    return {
      views: {
        startCycle: 1,
        description: 'Views start immediately',
      },
      likes: {
        startCycle: Math.floor(cycles.length * 0.1), // Start at 10% through
        description: 'Likes start after initial views',
      },
      comments: {
        startCycle: Math.floor(cycles.length * 0.25), // Start at 25% through
        description: 'Comments start after likes',
      },
      shares: {
        startCycle: Math.floor(cycles.length * 0.15), // Start at 15% through
      },
      saves: {
        startCycle: Math.floor(cycles.length * 0.2), // Start at 20% through
      },
      reposts: {
        startCycle: Math.floor(cycles.length * 0.3), // Start at 30% through
      },
    };
  }

  /**
   * Utility: Get random number in range
   */
  static _getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

module.exports = DeliveryEngine;
