# 🚀 SMM Panel - Quick Reference Guide

## Getting Started (5 minutes)

### Install & Run

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev

# Open http://localhost:3000
```

---

## Core Concepts

### 1. Delivery Engine (How orders are delivered)

```
❌ Bad Way:  100,000 views instantly
✅ Good Way: 100,000 views over 48 hours in 150 cycles

Random intervals between cycles (10-30 min)
Random quantity per cycle (varies 1,000-15,000)
Follows bell-curve pattern (slow → peak → slow)
```

### 2. Auto-Suggest (Intelligent suggestions)

```
User inputs: 100,000 views

System suggests automatically:
  Likes:     2-8%   = ~5,200 views
  Comments:  0.2-1% = ~450 views
  Shares:    0.5-2% = ~1,100 views
  
Each order is unique (varies each time)
```

### 3. Safety Score (Risk assessment)

```
Score: 0-100

85+: Very Safe ✅✅✅
70-84: Safe ✅✅
50-69: Medium ⚠️
30-49: Risky ⚠️⚠️
0-29: Very Risky ❌❌❌
```

### 4. Pricing (Cost calculation)

```
Views (50,000) × ₹85/K = ₹4,250
Likes (2,500) × ₹2.50/K = ₹6.25
Total = ₹4,256.25
With 5% discount = ₹4,043.44
```

---

## File Structure Quick Guide

```
backend/
├── models/           → Database schemas
├── services/         → Business logic ⭐
│   ├── DeliveryEngine.js
│   ├── AutoSuggestEngine.js
│   ├── PricingSystem.js
│   ├── SafetySystem.js
│   └── APIIntegrationService.js
├── controllers/      → HTTP handlers
└── routes/          → API endpoints

frontend/
├── pages/           → Pages (dashboard, orders)
├── components/      → React components
├── services/        → API client + state
└── globals.css      → Styling
```

---

## Key Classes & Methods

### DeliveryEngine

```javascript
// Calculate delivery cycles
DeliveryEngine.calculateDeliveryCycles(totalQuantity, durationHours)
// Returns: Array of cycles with random intervals

// Generate bell-curve pattern
DeliveryEngine.generateDeliveryPattern(cycles)
// Returns: Array with intensity per cycle

// Distribute engagement metrics
DeliveryEngine.distributeEngagementMetrics(engagement, cycles)
// Returns: Array of cycle distributions
```

### AutoSuggestEngine

```javascript
// Generate suggestions
AutoSuggestEngine.generateSuggestions(views, customRatios)
// Returns: {views, likes, comments, shares, saves}

// Suggest by content type
AutoSuggestEngine.suggestByContentType('reel')
// Returns: Adjusted ratios for content type

// Suggest by account size
AutoSuggestEngine.suggestByAccountSize(followers)
// Returns: Adjusted ratios based on followers
```

### PricingSystem

```javascript
// Calculate total price
PricingSystem.calculateOrderPrice(engagement, providers, discounts)
// Returns: {breakdown, basePrice, discountAmount, totalPrice}

// Get pricing breakdown per metric
PricingSystem.getPricingBreakdown(engagement, providers)
// Returns: Array of costs per metric
```

### SafetySystem

```javascript
// Calculate overall score
SafetySystem.calculateSafetyScore(orderData)
// Returns: 0-100 score

// Get risk level
SafetySystem.getRiskLevel(score)
// Returns: 'very-safe', 'safe', 'medium', 'risky', 'very-risky'

// Get recommendations
SafetySystem.getRecommendations(score)
// Returns: Array of safety recommendations
```

---

## API Endpoints Quick Reference

### Create Order
```
POST /api/orders/create

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
```

### Get Auto-Suggestions
```
POST /api/orders/auto-suggest

{
  "views": 100000,
  "contentType": "reel",
  "accountFollowers": 50000
}
```

### Calculate Price
```
POST /api/orders/calculate-price

{
  "engagement": {
    "views": 100000,
    "likes": 5000,
    "comments": 500
  },
  "providers": [...]
}
```

### Get Safety Score
```
GET /api/orders/:id/safety-score

Response: {
  "safetyScore": 85,
  "riskLevel": "safe",
  "recommendations": [...]
}
```

### Get Wallet
```
GET /api/wallet
```

### Deposit Funds
```
POST /api/wallet/deposit

{
  "amount": 1000,
  "method": "card"
}
```

---

## Common Workflows

### Create & Monitor Order

```javascript
// 1. Create order
POST /api/orders/create
→ Get order ID

// 2. Check delivery progress
GET /api/orders/:id
→ deliveryProgress: 0-100

// 3. Get safety info
GET /api/orders/:id/safety-score
→ safetyScore: 85/100

// 4. View stats
GET /api/orders/stats/summary
→ totalViewsDelivered, etc.
```

### Setup Wallet & Deposit

```javascript
// 1. Get wallet
GET /api/wallet
→ Shows current balance

// 2. Deposit funds
POST /api/wallet/deposit
→ Adds funds to wallet

// 3. Check transactions
GET /api/wallet/transactions
→ View history

// 4. Get summary
GET /api/wallet/summary
→ Monthly stats
```

---

## Configuration Files

### Backend (.env)

```
MONGODB_URI=mongodb://localhost:27017/smm-panel
PORT=5000
JWT_SECRET=your_secret_key
REDIS_URL=redis://localhost:6379
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Development Tips

### Enable Debugging

```bash
# Backend
DEBUG=* npm run dev

# Frontend
NODE_OPTIONS='--inspect' npm run dev
```

### Database Queries

```javascript
// MongoDB examples
db.orders.find({ status: 'completed' })
db.wallets.findOne({ userId: '...' })
db.transactions.find({ type: 'payment' })
```

### Redis Commands

```bash
redis-cli

# Check connection
ping

# View keys
keys *

# Get value
get order_123

# Clear cache
FLUSHALL
```

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### MongoDB Connection Error

```bash
# Check MongoDB is running
mongod

# Or use MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
```

### Redis Connection Error

```bash
# Check Redis is running
redis-server

# Check connection
redis-cli ping
```

---

## Performance Optimization

### Database Indexing

```javascript
// Create indexes for faster queries
db.orders.createIndex({ userId: 1, createdAt: -1 })
db.wallets.createIndex({ userId: 1 })
```

### Caching

```javascript
// Cache frequently accessed data
const cacheKey = `order_${id}`;
const cached = await redis.get(cacheKey);
```

### Pagination

```javascript
// Limit results per page
GET /api/orders?limit=10&page=1
```

---

## Testing

### Manual API Testing

```bash
# Using cURL
curl -X POST http://localhost:5000/api/orders/create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Or use Postman
# Import endpoints and test
```

---

## Important Files to Know

| File | Purpose |
|------|---------|
| `backend/src/services/DeliveryEngine.js` | Core delivery logic |
| `backend/src/services/AutoSuggestEngine.js` | Engagement suggestions |
| `backend/src/services/PricingSystem.js` | Cost calculation |
| `backend/src/services/SafetySystem.js` | Risk assessment |
| `backend/src/models/Order.js` | Order schema |
| `frontend/src/services/api.js` | API client |
| `frontend/src/pages/index.js` | Dashboard |

---

## Deployment Checklist

- [ ] Environment variables set
- [ ] MongoDB configured
- [ ] Redis configured
- [ ] SSL certificate installed
- [ ] Nginx configured
- [ ] PM2 setup for backend
- [ ] Vercel setup for frontend
- [ ] Monitoring configured
- [ ] Backups configured
- [ ] Domain configured

---

## Next: What to Build Next

Priority order:

1. **Authentication** - User login/signup
2. **Admin Panel** - Manage providers and users
3. **Payment Gateway** - Real payment processing
4. **Queue System** - Background job processing
5. **Notifications** - Email and push notifications
6. **Analytics** - Detailed reports and charts

---

## Useful Links

- [Backend API](./API.md)
- [System Design](./SYSTEM_DESIGN.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Project Summary](./PROJECT_SUMMARY.md)

---

## Need Help?

1. Check [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) for detailed explanations
2. Check [API.md](./API.md) for endpoint documentation
3. Review backend service files for logic details
4. Check browser console for frontend errors
5. Check server logs for backend errors

---

**Quick Reference Version**: 1.0  
**Last Updated**: 2024
