# SMM Panel - API Reference

## Base URL

```
http://localhost:5000/api
```

## Authentication

All endpoints require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

---

## Orders API

### 1. Create Order

**Endpoint:** `POST /orders/create`

**Request:**

```json
{
  "platform": "instagram",
  "contentUrl": "https://instagram.com/p/abc123def456",
  "orderType": "custom-mix",
  "engagement": {
    "views": 100000,
    "likes": 5000,
    "comments": 500,
    "shares": 1000,
    "saves": 2000,
    "reposts": 0
  },
  "duration": 48,
  "autoSuggest": true
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| platform | String | Yes | `instagram`, `youtube`, `tiktok`, `twitter`, `facebook` |
| contentUrl | String | Yes | Direct link to content |
| orderType | String | No | `full-package`, `views-only`, `likes-only`, `comments-only`, `custom-mix` |
| engagement | Object | Yes | Engagement metrics |
| duration | Number | Yes | Delivery time in hours (min: 1, max: 720) |
| autoSuggest | Boolean | No | Auto-suggest engagement ratios (default: true) |

**Response (201):**

```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "_id": "64a2f1c3e4f5a6b7c8d9e0f1",
    "userId": "64a2e5d2c1b0a9f8e7d6c5b4",
    "platform": "instagram",
    "contentUrl": "https://instagram.com/p/abc123def456",
    "engagement": {
      "views": 100000,
      "likes": 5000,
      "comments": 500,
      "shares": 1000,
      "saves": 2000,
      "reposts": 0
    },
    "duration": 48,
    "status": "pending",
    "deliveryProgress": 0,
    "pricing": {
      "basePrice": 150.50,
      "discountPercent": 0,
      "discountAmount": 0,
      "totalPrice": 150.50
    },
    "safetyInfo": {
      "speed": 85,
      "ratio": 90,
      "patternRandomness": 80,
      "overallSafetyScore": 85
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2. Get User Orders

**Endpoint:** `GET /orders`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | Number | 10 | Results per page |
| page | Number | 1 | Page number |

**Response (200):**

```json
{
  "success": true,
  "orders": [...],
  "total": 25,
  "page": 1,
  "pages": 3
}
```

---

### 3. Get Order Details

**Endpoint:** `GET /orders/:id`

**Response (200):**

```json
{
  "success": true,
  "order": {
    "_id": "64a2f1c3e4f5a6b7c8d9e0f1",
    ...
    "deliveryLog": [
      {
        "timestamp": "2024-01-15T10:35:00.000Z",
        "viewsAdded": 8000,
        "likesAdded": 150,
        "commentsAdded": 50,
        "sharesAdded": 30,
        "savesAdded": 100,
        "repostsAdded": 0
      }
    ]
  }
}
```

---

### 4. Auto-Suggest Engagement

**Endpoint:** `POST /orders/auto-suggest`

**Request:**

```json
{
  "views": 100000,
  "contentType": "reel",
  "accountFollowers": 50000
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| views | Number | Yes | Total views |
| contentType | String | No | `reel`, `carousel`, `post`, `story`, `video` |
| accountFollowers | Number | No | Account follower count |

**Response (200):**

```json
{
  "success": true,
  "suggestions": {
    "views": 100000,
    "likes": 5200,
    "comments": 450,
    "shares": 1100,
    "saves": 2300
  },
  "variation": {
    "likes": 1.05,
    "comments": 0.95,
    "shares": 1.12,
    "saves": 1.08
  }
}
```

---

### 5. Calculate Price

**Endpoint:** `POST /orders/calculate-price`

**Request:**

```json
{
  "engagement": {
    "views": 100000,
    "likes": 5000,
    "comments": 500,
    "shares": 1000,
    "saves": 2000
  },
  "providers": [...]
}
```

**Response (200):**

```json
{
  "success": true,
  "pricing": {
    "breakdown": {
      "views": 85.00,
      "likes": 25.00,
      "comments": 15.00,
      "shares": 10.00,
      "saves": 20.00
    },
    "basePrice": 155.00,
    "discountPercent": 5,
    "discountAmount": 7.75,
    "totalPrice": 147.25
  },
  "breakdown": [
    {
      "metric": "views",
      "quantity": 100000,
      "provider": "Provider A",
      "ratePerK": 0.85,
      "totalCost": 85.00
    }
  ]
}
```

---

### 6. Get Safety Score

**Endpoint:** `GET /orders/:id/safety-score`

**Response (200):**

```json
{
  "success": true,
  "safetyScore": 85,
  "riskLevel": "safe",
  "recommendations": [
    "✅ Order is very safe with natural delivery pattern.",
    "📊 Excellent randomization and timing."
  ],
  "details": {
    "speed": 85,
    "ratio": 90,
    "patternRandomness": 80,
    "overallSafetyScore": 85
  }
}
```

---

### 7. Cancel Order

**Endpoint:** `POST /orders/:id/cancel`

**Request:**

```json
{
  "reason": "Changed my mind"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Order cancelled",
  "order": {
    "_id": "...",
    "status": "cancelled",
    "cancelReason": "Changed my mind"
  }
}
```

---

### 8. Get Order Statistics

**Endpoint:** `GET /orders/stats/summary`

**Response (200):**

```json
{
  "success": true,
  "stats": {
    "totalOrders": 25,
    "completedOrders": 20,
    "failedOrders": 1,
    "totalViewsDelivered": 2500000,
    "totalLikesDelivered": 125000,
    "averageSafetyScore": 82
  }
}
```

---

## Wallet API

### 1. Get Wallet

**Endpoint:** `GET /wallet`

**Response (200):**

```json
{
  "success": true,
  "wallet": {
    "_id": "64a2e5d2c1b0a9f8e7d6c5b4",
    "userId": "64a2e5d2c1b0a9f8e7d6c5b3",
    "balance": 1500.75,
    "totalDeposited": 5000.00,
    "totalSpent": 3499.25,
    "transactions": ["64a2f1c3e4f5a6b7c8d9e0f2", ...]
  }
}
```

---

### 2. Deposit Funds

**Endpoint:** `POST /wallet/deposit`

**Request:**

```json
{
  "amount": 1000,
  "method": "card",
  "reference": "txn_1234567890"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | Number | Yes | Amount in INR |
| method | String | Yes | `card`, `upi`, `bank-transfer`, `crypto` |
| reference | String | No | Payment gateway reference |

**Response (200):**

```json
{
  "success": true,
  "message": "Deposit successful",
  "transaction": {
    "_id": "64a2f1c3e4f5a6b7c8d9e0f2",
    "type": "deposit",
    "amount": 1000,
    "status": "completed"
  },
  "newBalance": 2500.75
}
```

---

### 3. Get Transaction History

**Endpoint:** `GET /wallet/transactions`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | Number | 10 | Results per page |
| page | Number | 1 | Page number |

**Response (200):**

```json
{
  "success": true,
  "transactions": [
    {
      "_id": "...",
      "type": "deposit",
      "amount": 1000,
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 50,
  "page": 1
}
```

---

### 4. Get Wallet Summary

**Endpoint:** `GET /wallet/summary`

**Response (200):**

```json
{
  "success": true,
  "summary": {
    "balance": 1500.75,
    "totalDeposited": 5000.00,
    "totalSpent": 3499.25,
    "monthlySpent": 500.00,
    "transactions": 25,
    "user": {
      "username": "john_doe",
      "totalOrders": 12
    }
  }
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "Invalid amount"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": "No token provided"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Order not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limiting

- **Requests per minute**: 60 per IP
- **Requests per hour**: 3600 per IP

Headers included in response:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1234567890
```

---

## Webhooks

Webhooks for order status updates:

```
POST {your_webhook_url}

{
  "event": "order.completed",
  "orderId": "64a2f1c3e4f5a6b7c8d9e0f1",
  "status": "completed",
  "deliveredEngagement": {
    "views": 100000,
    "likes": 5000,
    "comments": 500
  },
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

---

## Testing with cURL

```bash
# Create order
curl -X POST http://localhost:5000/api/orders/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "instagram",
    "contentUrl": "https://instagram.com/p/abc123",
    "engagement": {"views": 50000},
    "duration": 24
  }'

# Get wallet
curl -X GET http://localhost:5000/api/wallet \
  -H "Authorization: Bearer YOUR_TOKEN"

# Deposit funds
curl -X POST http://localhost:5000/api/wallet/deposit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "method": "card"}'
```

---

**Last Updated**: 2024  
**Version**: 1.0.0
