# SMM Panel - Complete System Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [Core Features](#core-features)
5. [API Documentation](#api-documentation)
6. [Delivery Engine](#delivery-engine)
7. [Safety System](#safety-system)
8. [Deployment](#deployment)

---

## 🎯 Overview

SMM Panel is a sophisticated Social Media Marketing platform that automates engagement delivery across Instagram, YouTube, TikTok, and other platforms. The system provides:

- **Multi-provider integration** with automatic failover
- **Intelligent auto-suggest** system for natural engagement
- **Gradual delivery** to avoid detection by platform algorithms
- **Safety scoring** based on delivery patterns
- **Real-time pricing** calculation
- **Wallet management** with multiple payment methods
- **Bulk order processing** capability

---

## 🏗️ Architecture

### Project Structure

```
backend/
├── src/
│   ├── models/          # Database schemas
│   ├── controllers/     # HTTP request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API endpoints
│   ├── middleware/      # Express middleware
│   ├── config/          # Configuration files
│   ├── utils/           # Utility functions
│   ├── jobs/            # Background tasks
│   └── index.js         # Entry point
├── package.json
└── .env.example

frontend/
├── src/
│   ├── pages/           # Next.js pages
│   ├── components/      # React components
│   ├── services/        # API client & state
│   └── utils/           # Utilities
├── package.json
└── next.config.js

docs/
├── API.md
├── SYSTEM_DESIGN.md
├── DEPLOYMENT.md
└── README.md
```

### Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React, Next.js, Tailwind CSS
- **Database**: MongoDB
- **Queue**: BullMQ, Redis
- **Authentication**: JWT
- **Payment**: Stripe/PayPal integration ready

---

## 📦 Installation & Setup

### Prerequisites

- Node.js >= 16.0.0
- MongoDB >= 4.4
- Redis >= 6.0
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start development server
npm run dev

# Start production server
npm start
```

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

### Environment Variables

**Backend (.env)**

```
MONGODB_URI=mongodb://localhost:27017/smm-panel
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
REDIS_URL=redis://localhost:6379
```

**Frontend (.env.local)**

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🚀 Core Features

### 1. Dashboard

Displays real-time metrics:
- Total views delivered
- Total likes delivered
- Active orders count
- Wallet balance
- Safety score

### 2. API Key Management

Add multiple SMM providers:

```javascript
const apiKeyData = {
  panelName: "SMM Provider 1",
  panelType: "smm", // or "rest", "soap"
  apiUrl: "https://panel.example.com/api",
  apiKey: "your_api_key",
  priority: 1
};
```

### 3. New Order System

Create orders with various modes:

```javascript
const orderData = {
  platform: "instagram",
  contentUrl: "https://instagram.com/p/xyz123",
  orderType: "custom-mix",
  engagement: {
    views: 100000,
    likes: 5000,
    comments: 500,
    shares: 200
  },
  duration: 48, // hours
  autoSuggest: true
};
```

### 4. Auto-Suggest Engine

Automatically suggests natural engagement ratios:

```
Views: 100,000
Auto-Suggested:
  - Likes: 2-8% (3,500) ✅
  - Comments: 0.2-1% (600) ✅
  - Shares: 0.5-2% (1,200) ✅
  - Saves: 0.5-3% (2,000) ✅
```

**Variation per content type:**

| Type | Likes | Comments | Shares | Saves |
|------|-------|----------|--------|-------|
| Reel | 3-12% | 0.5-2% | 1-3% | 1-4% |
| Carousel | 4-10% | 0.3-1.5% | 1-4% | 1-3% |
| Post | 2-8% | 0.2-1% | 0.5-2% | 0.5-3% |

---

## 📊 Delivery Engine

### How It Works

**Input:**
- 1,000,000 views
- Duration: 48 hours

**Processing:**

1. **Calculate cycles**: 48 hours ÷ 10-30 min intervals = 100-200 cycles
2. **Randomize quantities**: Each cycle gets random 1-5% of remaining
3. **Generate pattern**: Bell curve (slow → peak → slow)
4. **Distribute metrics**: Likes, comments distributed across cycles

### Delivery Pattern Graph

```
Intensity
   |     ___
   |   /     \
   | /         \
   |/___________\
   └─────────────── Cycles →
```

**Example Cycle Distribution:**

```
Cycle 1: 8,000 views    | 150 likes | 80 comments
Cycle 2: 12,000 views   | 200 likes | 120 comments
Cycle 3: 9,500 views    | 180 likes | 100 comments
...
```

### Engagement Delay Logic

Different metrics start at different times:

| Metric | Start Time | Reason |
|--------|-----------|--------|
| Views | Cycle 1 | Immediate |
| Likes | ~10% through | Natural delay |
| Comments | ~25% through | Longer delay |
| Shares | ~15% through | Medium delay |

This simulates real human behavior - people view first, then like, then comment.

---

## 🛡️ Safety System

### Safety Score Calculation (0-100)

```
Score = (Speed × 0.3) + (Ratio × 0.3) + (Pattern × 0.25) + (Behavior × 0.15)
```

### Components

**1. Speed Score**
```
Engagements/hour > 100K  = 20 (Very risky)
Engagements/hour > 50K   = 40
Engagements/hour > 20K   = 60
Engagements/hour > 10K   = 80
Engagements/hour < 10K   = 100 (Safe)
```

**2. Ratio Score**
```
Likes should be: 1-15% of views (Natural range)
Comments should be: 0.2-2% of views
Shares should be: 0.5-3% of views
```

**3. Pattern Randomness**
- Higher variation = safer (harder to detect as fake)
- Too consistent = risky (signals bot activity)

**4. Behavior Score**
- Random intervals between deliveries
- Time-based activity (night & day variation)
- Organic engagement flow

### Risk Levels

```
Score >= 85: Very Safe ✅✅✅
Score >= 70: Safe ✅✅
Score >= 50: Medium ⚠️
Score >= 30: Risky ⚠️⚠️
Score < 30:  Very Risky ❌❌❌
```

---

## 💰 Pricing System

### Calculation Formula

```
Total Price = Σ(Metric Quantity × Rate per 1K / 1000) - Discount
```

**Example:**

```
Views (50,000):     ₹4.28
  50,000 ÷ 1000 × ₹85 = ₹4.25

Likes (2,500):      ₹6.25
  2,500 ÷ 1000 × ₹2.50 = ₹6.25

Total: ₹10.50
```

### Discount Tiers

```
Base Price > ₹5,000  = 10% discount
Base Price > ₹1,000  = 5% discount
Base Price > ₹500    = 2% discount
```

### Multi-Provider Selection

System automatically selects **cheapest provider** for each metric:

```
Views:     Provider A (₹85/K) ✅ Cheapest
Likes:     Provider C (₹2.40/K) ✅ Cheapest
Comments:  Provider B (₹12/K) ✅ Cheapest
```

---

## 🔌 API Documentation

### Authentication

All endpoints require JWT token in header:

```
Authorization: Bearer <your_jwt_token>
```

### Orders Endpoints

#### Create Order
```
POST /api/orders/create
Content-Type: application/json

{
  "platform": "instagram",
  "contentUrl": "https://instagram.com/p/xyz",
  "engagement": {
    "views": 100000,
    "likes": 5000,
    "comments": 500
  },
  "duration": 48,
  "autoSuggest": true
}

Response:
{
  "success": true,
  "order": {
    "_id": "...",
    "status": "pending",
    "safetyScore": 85,
    "deliveryCycles": [...],
    "pricing": {
      "totalPrice": 150.50
    }
  }
}
```

#### Get User Orders
```
GET /api/orders?limit=10&page=1
```

#### Get Safety Score
```
GET /api/orders/:id/safety-score

Response:
{
  "safetyScore": 85,
  "riskLevel": "safe",
  "recommendations": [...]
}
```

#### Auto-Suggest
```
POST /api/orders/auto-suggest

{
  "views": 100000,
  "contentType": "reel",
  "accountFollowers": 50000
}

Response:
{
  "suggestions": {
    "views": 100000,
    "likes": 5200,
    "comments": 450,
    "shares": 1100,
    "saves": 2300
  }
}
```

### Wallet Endpoints

#### Get Wallet
```
GET /api/wallet
```

#### Deposit Funds
```
POST /api/wallet/deposit

{
  "amount": 1000,
  "method": "card"
}
```

#### Get Transactions
```
GET /api/wallet/transactions?limit=10&page=1
```

---

## 🔧 Advanced Features

### 1. Bulk Order Processing

Upload CSV with multiple links:

```
url,platform,views
https://instagram.com/p/1,instagram,50000
https://instagram.com/p/2,instagram,75000
https://tiktok.com/video/3,tiktok,100000
```

System processes all orders in parallel with queue management.

### 2. Failover System

If primary provider fails:

```
Provider A fails
  ↓
Automatic switch to Provider B
  ↓
If B fails, try Provider C
  ↓
All fail → Return error
```

### 3. Rate Limiting

Each provider has rate limits:

```
Max requests/hour: 1000
Max quantity/day: 1,000,000
```

### 4. Duplicate Detection

System prevents duplicate orders:

```
Same URL + Same metrics = Rejected
```

---

## 📈 Monitoring & Logs

### Logs Location

- **Backend**: `/backend/logs/`
- **Delivery**: Order delivery logged in `deliveryLog` array
- **Errors**: Comprehensive error tracking

### Monitoring Metrics

- Order success rate
- Provider availability
- Average delivery time
- Safety score trends
- Payment completion rate

---

## 🚀 Deployment

### Docker Setup

```dockerfile
# Backend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY backend ./
RUN npm install
CMD ["npm", "start"]
```

### Production Checklist

- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/SSL
- [ ] Setup MongoDB replication
- [ ] Configure Redis persistence
- [ ] Setup monitoring (PM2, New Relic)
- [ ] Enable CORS properly
- [ ] Rate limiting configured
- [ ] Backup strategy implemented
- [ ] CDN for static files
- [ ] Error tracking (Sentry)

---

## ⚠️ Important Security Notes

1. **API Keys**: Store securely, never expose in frontend
2. **Tokens**: JWT tokens should be short-lived (7-30 days)
3. **Rate Limiting**: Implement to prevent abuse
4. **Input Validation**: All user inputs must be validated
5. **HTTPS**: Always use in production
6. **Database**: Use strong passwords, enable authentication
7. **Monitoring**: Log and monitor all order activities

---

## 🔄 Workflow Example

```
1. User logs in
   ↓
2. User navigates to "Create Order"
   ↓
3. Enters views count (100,000)
   ↓
4. System auto-suggests engagement
   - Likes: ~5,000
   - Comments: ~500
   - Shares: ~1,000
   ↓
5. User reviews safety score (85/100) ✅
   ↓
6. System calculates price (₹150.50)
   ↓
7. User confirms order
   ↓
8. Order deducted from wallet
   ↓
9. Order submitted to cheapest provider
   ↓
10. Delivery engine starts staggered delivery
    - 100-200 cycles over 48 hours
    - Random quantity per cycle
    - Following bell-curve pattern
    ↓
11. Order monitoring continues
    - Updates delivery progress
    - Logs all activity
    ↓
12. Order completes
    - Status marked as "completed"
    - User notified
    - Order history updated
```

---

## 📞 Support

For issues or questions:
- Check documentation
- Review delivery logs
- Contact support team

---

## 📝 License

Proprietary - All rights reserved

---

**Version**: 1.0.0  
**Last Updated**: 2024
