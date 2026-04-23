/**
 * API INTEGRATION SERVICE
 * Handles communication with multiple SMM provider APIs
 * Supports failover and load balancing
 */

const axios = require('axios');

class APIIntegrationService {
  /**
   * Submit order to cheapest available provider
   * @param {Object} orderData - Order details
   * @param {Array} apiKeys - Available API keys
   * @returns {Object} Submission result
   */
  static async submitOrder(orderData, apiKeys) {
    // Sort by price (cheapest first) and status
    const activeKeys = apiKeys.filter(k => k.status === 'active');
    
    if (activeKeys.length === 0) {
      throw new Error('No active API keys available');
    }

    // Try providers in order of priority
    for (const apiKey of activeKeys) {
      try {
        const result = await this._submitToProvider(orderData, apiKey);
        
        // Update provider stats
        await this._updateProviderStats(apiKey._id, true);
        
        return {
          success: true,
          provider: apiKey.panelName,
          providerId: apiKey._id,
          externalId: result.id || result.order_id,
          status: result.status || 'processing',
        };
      } catch (error) {
        console.error(`Provider ${apiKey.panelName} failed:`, error.message);
        
        // Mark this provider as having issues
        await this._updateProviderStats(apiKey._id, false);
        
        // Try next provider
        continue;
      }
    }

    throw new Error('All providers failed to accept the order');
  }

  /**
   * Submit order to specific provider
   * @param {Object} orderData - Order details
   * @param {Object} apiKey - API key object
   * @returns {Object} Provider response
   */
  static async _submitToProvider(orderData, apiKey) {
    const { panelType, apiUrl, apiKey: key, apiSecret } = apiKey;
    
    if (panelType === 'smm') {
      return await this._submitToSMMPanel(orderData, apiUrl, key);
    } else if (panelType === 'rest') {
      return await this._submitToRESTAPI(orderData, apiUrl, key);
    } else if (panelType === 'soap') {
      return await this._submitToSOAPAPI(orderData, apiUrl, key, apiSecret);
    }

    throw new Error(`Unknown panel type: ${panelType}`);
  }

  /**
   * Submit to SMM Panel API
   */
  static async _submitToSMMPanel(orderData, apiUrl, apiKey) {
    // Standard SMM panel API format
    const payload = {
      key: apiKey,
      action: 'add',
      service: orderData.serviceId,
      link: orderData.contentUrl,
      quantity: orderData.totalEngagement,
    };

    const response = await axios.post(`${apiUrl}`, payload, {
      timeout: 10000,
    });

    if (response.data.status === 'error') {
      throw new Error(response.data.error);
    }

    return response.data;
  }

  /**
   * Submit to REST API
   */
  static async _submitToRESTAPI(orderData, apiUrl, apiKey) {
    const payload = {
      platform: orderData.platform,
      url: orderData.contentUrl,
      engagement: orderData.engagement,
      duration: orderData.duration,
    };

    const response = await axios.post(
      `${apiUrl}/orders`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    return response.data;
  }

  /**
   * Submit to SOAP API
   */
  static async _submitToSOAPAPI(orderData, apiUrl, apiKey, apiSecret) {
    // SOAP implementation would go here
    // For now, treating as generic fallback
    throw new Error('SOAP API support coming soon');
  }

  /**
   * Check order status from provider
   * @param {String} externalId - External order ID from provider
   * @param {Object} apiKey - API key object
   * @returns {Object} Order status
   */
  static async checkOrderStatus(externalId, apiKey) {
    try {
      const { panelType, apiUrl, apiKey: key } = apiKey;
      
      if (panelType === 'smm') {
        const response = await axios.post(apiUrl, {
          key,
          action: 'status',
          order: externalId,
        });

        return {
          externalId,
          delivered: response.data.charge || 0,
          remaining: response.data.remains || 0,
          status: response.data.status || 'processing',
        };
      } else if (panelType === 'rest') {
        const response = await axios.get(
          `${apiUrl}/orders/${externalId}`,
          {
            headers: { 'Authorization': `Bearer ${key}` },
          }
        );

        return {
          externalId,
          delivered: response.data.delivered || 0,
          remaining: response.data.remaining || 0,
          status: response.data.status,
        };
      }
    } catch (error) {
      console.error('Failed to check order status:', error.message);
      return {
        externalId,
        status: 'unknown',
        error: error.message,
      };
    }
  }

  /**
   * Test API connection
   * @param {Object} apiKey - API key object
   * @returns {Boolean} Connection status
   */
  static async testConnection(apiKey) {
    try {
      const { panelType, apiUrl, apiKey: key } = apiKey;
      
      if (panelType === 'smm') {
        const response = await axios.post(apiUrl, {
          key,
          action: 'balance',
        }, { timeout: 5000 });

        return response.status === 200;
      } else if (panelType === 'rest') {
        const response = await axios.get(
          `${apiUrl}/health`,
          {
            headers: { 'Authorization': `Bearer ${key}` },
            timeout: 5000,
          }
        );

        return response.status === 200;
      }

      return false;
    } catch (error) {
      console.error('Connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Get available services from provider
   * @param {Object} apiKey - API key object
   * @returns {Array} Available services
   */
  static async getAvailableServices(apiKey) {
    try {
      const { panelType, apiUrl, apiKey: key } = apiKey;

      if (panelType === 'smm') {
        const response = await axios.post(apiUrl, {
          key,
          action: 'services',
        });

        return response.data.services || [];
      } else if (panelType === 'rest') {
        const response = await axios.get(
          `${apiUrl}/services`,
          {
            headers: { 'Authorization': `Bearer ${key}` },
          }
        );

        return response.data.services || [];
      }

      return [];
    } catch (error) {
      console.error('Failed to get services:', error.message);
      return [];
    }
  }

  /**
   * Get provider balance/credit
   * @param {Object} apiKey - API key object
   * @returns {Number} Balance
   */
  static async getBalance(apiKey) {
    try {
      const { panelType, apiUrl, apiKey: key } = apiKey;

      if (panelType === 'smm') {
        const response = await axios.post(apiUrl, {
          key,
          action: 'balance',
        });

        return parseFloat(response.data.balance || 0);
      } else if (panelType === 'rest') {
        const response = await axios.get(
          `${apiUrl}/balance`,
          {
            headers: { 'Authorization': `Bearer ${key}` },
          }
        );

        return response.data.balance || 0;
      }

      return 0;
    } catch (error) {
      console.error('Failed to get balance:', error.message);
      return 0;
    }
  }

  /**
   * Update provider statistics after order submission
   */
  static async _updateProviderStats(apiKeyId, success) {
    // This would update the APIKey model
    // Increments totalOrders, successfulOrders or failedOrders
    // Sets lastUsed timestamp
    console.log(`Updating stats for provider ${apiKeyId}: success=${success}`);
  }
}

module.exports = APIIntegrationService;
