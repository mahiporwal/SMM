# SMM Panel - Deployment Guide

## Production Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] MongoDB production instance set up
- [ ] Redis production instance set up
- [ ] SSL certificates generated
- [ ] Domain configured
- [ ] Backup strategy implemented
- [ ] Monitoring tools installed
- [ ] Error tracking (Sentry) configured

### Backend Deployment

#### Option 1: Docker (Recommended)

```bash
# Build image
docker build -t smm-panel-backend ./backend

# Run container
docker run -d \
  --name smm-backend \
  -p 5000:5000 \
  --env-file .env.production \
  smm-panel-backend

# With docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

#### Option 2: Traditional Server

```bash
# Install PM2 globally
npm install -g pm2

# Deploy
cd /home/app/smm-panel/backend
npm install --production
pm2 start src/index.js --name "smm-backend"

# Setup auto-restart
pm2 startup
pm2 save
```

### Frontend Deployment

#### Option 1: Vercel (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment: Add NEXT_PUBLIC_API_URL
```

#### Option 2: Docker

```bash
# Build
docker build -t smm-panel-frontend ./frontend

# Run
docker run -d \
  --name smm-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.example.com \
  smm-panel-frontend
```

### Database Setup

#### MongoDB Atlas (Cloud)

```bash
# Connect using MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smm-panel
```

#### Self-Hosted MongoDB

```bash
# Install MongoDB
# Enable authentication
# Create database and users
# Configure backups

# Connect
MONGODB_URI=mongodb://user:pass@server:27017/smm-panel
```

### Redis Setup

#### Redis Cloud

```bash
REDIS_URL=redis://:password@server.com:12345
```

#### Self-Hosted Redis

```bash
# Install Redis
redis-server --requirepass "your_password"

# Connect
REDIS_URL=redis://:password@localhost:6379
```

### Nginx Configuration

```nginx
upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    }
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### SSL Certificates

```bash
# Using Let's Encrypt + Certbot
sudo certbot certonly --standalone \
  -d api.example.com \
  -d example.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Monitoring & Logging

#### PM2 Monitoring

```bash
# Install PM2 Plus
pm2 install pm2-auto-pull
pm2 link {secret_key} {api_key}

# Monitor
pm2 monitor
```

#### ELK Stack (Elasticsearch, Logstash, Kibana)

```bash
# Logs will be centralized and searchable
# Configure backend to send logs to ELK
```

#### Sentry Error Tracking

```javascript
// In backend/src/index.js
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "your_sentry_dsn",
  environment: "production",
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Performance Optimization

#### Caching

```javascript
// Redis caching in services
const cacheKey = `order_${orderId}`;
const cachedOrder = await redis.get(cacheKey);

if (cachedOrder) {
  return JSON.parse(cachedOrder);
}

const order = await Order.findById(orderId);
await redis.setex(cacheKey, 3600, JSON.stringify(order));
return order;
```

#### Database Indexes

```javascript
// Create indexes for frequently queried fields
// In MongoDB

db.orders.createIndex({ userId: 1, createdAt: -1 });
db.orders.createIndex({ status: 1 });
db.wallets.createIndex({ userId: 1 });
db.transactions.createIndex({ userId: 1, createdAt: -1 });
```

#### CDN for Static Files

```javascript
// Use CloudFlare or AWS CloudFront
// Configure Next.js for static exports
```

### Backups

#### MongoDB Backup

```bash
# Daily backup
mongodump --uri mongodb://user:pass@localhost:27017/smm-panel \
  --out /backups/mongodb-$(date +%Y%m%d)

# Upload to S3
aws s3 cp /backups/mongodb-* s3://my-bucket/backups/
```

#### Redis Backup

```bash
# Automatic persistence
save 900 1        # Save if 1 key changed in 900 sec
save 300 10       # Save if 10 keys changed in 300 sec
save 60 10000     # Save if 10000 keys changed in 60 sec

# Manual backup
redis-cli BGSAVE
```

### CI/CD Pipeline

#### GitHub Actions

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build backend
        run: |
          cd backend
          npm install
          npm run build
      
      - name: Build frontend
        run: |
          cd frontend
          npm install
          npm run build
      
      - name: Deploy
        run: |
          # Your deployment script
          ./deploy.sh
```

### Performance Benchmarks

```
Target metrics:
- API Response time: < 200ms
- Database query: < 50ms
- Page load: < 3s
- Uptime: > 99.9%
```

### Monitoring Commands

```bash
# Check service status
systemctl status nginx
systemctl status mongodb
systemctl status redis

# View logs
pm2 logs smm-backend
docker logs smm-backend

# Monitor resources
htop
iostat
vmstat

# Database stats
mongo --eval "db.stats()"
redis-cli info stats
```

### Troubleshooting

**Issue**: High memory usage
```bash
# Check memory leaks
node --inspect src/index.js

# Restart service
pm2 restart smm-backend
```

**Issue**: Database connection timeout
```bash
# Check connection
mongo "mongodb://..." --eval "db.adminCommand('ping')"

# Restart MongoDB
systemctl restart mongodb
```

**Issue**: API slow
```bash
# Check database indexes
db.orders.getIndexes()

# Check Redis
redis-cli ping

# Monitor queries
db.setProfilingLevel(1)
```

### Rollback Plan

```bash
# Keep previous versions
git tag v1.0.0
git tag v1.0.1

# Quick rollback
git checkout v1.0.0
npm run build
pm2 restart smm-backend
```

### Post-Deployment

- [ ] Test all API endpoints
- [ ] Verify database backups
- [ ] Check monitoring dashboards
- [ ] Test payment integration
- [ ] Verify email notifications
- [ ] Load test the system
- [ ] Document deployment process
- [ ] Train team on monitoring

---

## Production Environment Example

```
Backend:
- Server: Ubuntu 20.04 LTS
- Node: v16 LTS
- PM2: Process manager
- Nginx: Reverse proxy
- MongoDB: Atlas or self-hosted
- Redis: Cloud or self-hosted

Frontend:
- Hosted on Vercel or Docker
- CDN: CloudFlare
- Domain: GoDaddy / Route53

Monitoring:
- PM2 Plus for backend
- Sentry for errors
- Cloudflare analytics for frontend
- MongoDB Atlas monitoring
```

---

**Version**: 1.0.0
**Last Updated**: 2024
