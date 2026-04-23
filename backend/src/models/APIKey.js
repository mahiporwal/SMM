const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  panelName: {
    type: String,
    required: true,
  },
  panelType: {
    type: String,
    enum: ['smm', 'rest', 'soap'],
    required: true,
  },
  apiUrl: {
    type: String,
    required: true,
  },
  apiKey: {
    type: String,
    required: true,
    select: false, // Don't return in queries by default
  },
  apiSecret: {
    type: String,
    select: false,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'testing', 'failed'],
    default: 'inactive',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: Number,
    default: 1,
    description: 'Lower number = higher priority',
  },
  services: [{
    serviceId: String,
    platform: String,
    metric: String,
    pricePerK: Number,
    minQuantity: Number,
    maxQuantity: Number,
  }],
  stats: {
    totalOrders: {
      type: Number,
      default: 0,
    },
    successfulOrders: {
      type: Number,
      default: 0,
    },
    failedOrders: {
      type: Number,
      default: 0,
    },
    averageDeliveryTime: Number,
    lastUsed: Date,
  },
  lastTestedAt: Date,
  testStatus: {
    type: String,
    enum: ['success', 'failed', 'pending'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('APIKey', apiKeySchema);
