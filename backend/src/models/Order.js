const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  platform: {
    type: String,
    enum: ['instagram', 'youtube', 'tiktok', 'twitter', 'facebook'],
    required: true,
  },
  contentUrl: {
    type: String,
    required: true,
  },
  orderType: {
    type: String,
    enum: ['full-package', 'views-only', 'likes-only', 'comments-only', 'custom-mix'],
    default: 'custom-mix',
  },
  engagement: {
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    saves: {
      type: Number,
      default: 0,
    },
    reposts: {
      type: Number,
      default: 0,
    },
  },
  autoSuggestedEngagement: {
    type: Object,
    default: {},
  },
  duration: {
    type: Number,
    required: true,
    description: 'Duration in hours',
  },
  deliveryMode: {
    type: String,
    enum: ['gradual', 'instant', 'custom'],
    default: 'gradual',
  },
  pricing: {
    basePrice: Number,
    discountPercent: {
      type: Number,
      default: 0,
    },
    totalPrice: Number,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'delivering', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  deliveryProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  deliveryLog: [{
    timestamp: Date,
    viewsAdded: Number,
    likesAdded: Number,
    commentsAdded: Number,
    sharesAdded: Number,
    savesAdded: Number,
    repostsAdded: Number,
  }],
  failedAttempts: {
    type: Number,
    default: 0,
  },
  provider: {
    type: String,
    description: 'SMM Provider used',
  },
  parentProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'APIKey',
  },
  safetyInfo: {
    speed: Number,
    ratio: Number,
    patternRandomness: Number,
    overallSafetyScore: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  startedAt: Date,
  completedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
