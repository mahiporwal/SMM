# SMM Panel - Public Deployment Guide

## 🌐 Converting from Localhost to Public

This guide helps you deploy your SMM Panel from local development to a public, production-ready system.

---

## 1️⃣ Prerequisites

- Public domain name (e.g., `yourdomain.com`)
- SSL certificate (Let's Encrypt - free)
- Public server (VPS, cloud, etc.)
- MongoDB instance (Atlas or self-hosted)
- Redis instance

---

## 2️⃣ Domain Setup

### Step 1: Get a Domain
- Register at GoDaddy, Namecheap, or Route53
- Example: `yourdomain.com`

### Step 2: Point DNS to Your Server
```
A Record: @ → Your_Server_IP
CNAME: api → yourdomain.com
CNAME: www → yourdomain.com
```

**Example DNS Records:**
```
@ (root)     A      1.2.3.4         (Your API server IP)
api          CNAME  yourdomain.com
www          CNAME  yourdomain.com
```

---

## 3️⃣ SSL/HTTPS Setup

### Using Let's Encrypt (Free - Recommended)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d api.yourdomain.com \
  -d www.yourdomain.com

# Certificates saved at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### Auto-Renewal
```bash
# Setup automatic renewal
sudo certbot renew --dry-run
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 4️⃣ Environment Configuration

### Backend Setup

**Create `.env` file:**

```bash
cd backend
cp .env.example .env
nano .env
```

**Update `.env`:**

```env
# Database (use MongoDB Atlas or self-hosted)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smm-panel
# OR for self-hosted:
# MONGODB_URI=mongodb://mongo-server:27017/smm-panel

# Server
PORT=5000
NODE_ENV=production
SERVER_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# JWT Secret (Generate a strong one!)
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRE=7d

# Redis
REDIS_URL=redis://redis-server:6379
# OR for Redis Cloud:
# REDIS_URL=redis://:password@server.redis.cloud:12345

# CORS - Allow your frontend domain
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# SSL Certificates
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### Frontend Setup

**Create `.env.production`:**

```bash
cd frontend
cp .env.example .env.production
nano .env.production
```

**Update `.env.production`:**

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_ENV=production
```

---

## 5️⃣ Nginx Configuration

### Create Nginx Config for API

**Create `/etc/nginx/sites-available/smm-api`:**

```nginx
upstream backend {
    server localhost:5000;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/smm-api-access.log;
    error_log /var/log/nginx/smm-api-error.log;

    # Proxy Configuration
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }
}
```

### Create Nginx Config for Frontend

**Create `/etc/nginx/sites-available/smm-frontend`:**

```nginx
upstream frontend {
    server localhost:3000;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Logging
    access_log /var/log/nginx/smm-frontend-access.log;
    error_log /var/log/nginx/smm-frontend-error.log;

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Enable Nginx Sites

```bash
# Create symbolic links
sudo ln -s /etc/nginx/sites-available/smm-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/smm-frontend /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 6️⃣ Deploy Backend

### Using PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Navigate to backend
cd /path/to/smm-panel/backend

# Install dependencies
npm install --production

# Start with PM2
pm2 start src/index.js --name "smm-backend"

# Enable auto-restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 logs smm-backend
pm2 monit
```

### Using Docker (Alternative)

```bash
cd /path/to/smm-panel/backend

# Build Docker image
docker build -t smm-backend:latest .

# Run container
docker run -d \
  --name smm-backend \
  --restart always \
  -p 5000:5000 \
  --env-file .env \
  smm-backend:latest

# View logs
docker logs -f smm-backend
```

---

## 7️⃣ Deploy Frontend

### Option 1: Vercel (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod

# Add environment variables in Vercel Dashboard:
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Option 2: Self-Hosted with PM2

```bash
cd /path/to/smm-panel/frontend

# Build
npm run build

# Start with PM2
pm2 start "npm start" --name "smm-frontend"

# Monitor
pm2 logs smm-frontend
```

### Option 3: Docker

```bash
cd /path/to/smm-panel/frontend

# Build
docker build -t smm-frontend:latest .

# Run
docker run -d \
  --name smm-frontend \
  --restart always \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  smm-frontend:latest
```

---

## 8️⃣ Database Setup

### MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create account
3. Create cluster
4. Create database user
5. Get connection string
6. Add to `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smm-panel
```

### Self-Hosted MongoDB

```bash
# Install MongoDB
sudo apt-get install -y mongodb-org

# Enable auto-start
sudo systemctl enable mongod
sudo systemctl start mongod

# Create database and user
mongo
> use smm-panel
> db.createUser({user: "admin", pwd: "strong_password", roles: ["readWrite"]})
```

---

## 9️⃣ Redis Setup

### Redis Cloud (Recommended)

1. Go to https://redis.com/cloud/
2. Create free account
3. Get connection URL
4. Add to `.env`:

```env
REDIS_URL=redis://:password@server.redis.cloud:12345
```

### Self-Hosted Redis

```bash
# Install
sudo apt-get install redis-server

# Enable auto-start
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Set password (optional)
sudo nano /etc/redis/redis.conf
# Uncomment: requirepass your_password
sudo systemctl restart redis-server

# Connect
redis-cli -a your_password
```

---

## 🔟 Verification Checklist

- [ ] Domain resolves to your IP
- [ ] SSL certificate working (https://)
- [ ] API endpoint accessible: https://api.yourdomain.com/health
- [ ] Frontend loads: https://yourdomain.com
- [ ] Can log in
- [ ] Can create orders
- [ ] Wallet functions work
- [ ] MongoDB connection working
- [ ] Redis connection working
- [ ] PM2/Docker running properly

---

## 1️⃣1️⃣ Testing Public Access

### Test API

```bash
# Test health endpoint
curl -k https://api.yourdomain.com/health

# Test with token
curl -X GET https://api.yourdomain.com/api/wallet \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Frontend

```bash
# Open in browser
https://yourdomain.com

# Check browser console for any errors
# Verify API calls are going to https://api.yourdomain.com
```

---

## 1️⃣2️⃣ Monitoring & Logs

### View Application Logs

```bash
# PM2 logs
pm2 logs smm-backend
pm2 logs smm-frontend

# Docker logs
docker logs -f smm-backend
docker logs -f smm-frontend

# Nginx logs
tail -f /var/log/nginx/smm-api-access.log
tail -f /var/log/nginx/smm-api-error.log
```

### Monitor Resources

```bash
# CPU and memory usage
pm2 monit

# Server resources
htop
```

---

## 1️⃣3️⃣ Production Best Practices

### Security

- [ ] Change all default passwords
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS only (no HTTP)
- [ ] Configure firewall rules
- [ ] Use rate limiting
- [ ] Enable CORS only for your domain
- [ ] Regular security updates

### Performance

- [ ] Enable gzip compression in Nginx
- [ ] Setup CDN for static files (CloudFlare)
- [ ] Configure database indexes
- [ ] Setup caching (Redis)
- [ ] Monitor response times

### Backups

```bash
# MongoDB backup
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/smm-panel" \
  --out /backups/mongodb-$(date +%Y%m%d)

# Schedule with cron
0 2 * * * /path/to/backup-script.sh
```

---

## 1️⃣4️⃣ Troubleshooting

### SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -text -noout

# Renew certificate
sudo certbot renew --force-renewal
```

### API Not Accessible

```bash
# Check Nginx configuration
sudo nginx -t

# Check firewall
sudo ufw status
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp

# Check port listening
sudo netstat -tlnp | grep 5000
```

### Frontend Can't Connect to API

```bash
# Check API URL in frontend .env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Check CORS configuration
# Verify ALLOWED_ORIGINS in backend .env

# Check browser console for CORS errors
```

---

## 1️⃣5️⃣ Useful Commands

```bash
# Restart services
sudo systemctl restart nginx
pm2 restart smm-backend
pm2 restart smm-frontend

# Check service status
sudo systemctl status nginx
pm2 status

# View real-time logs
pm2 logs smm-backend --lines 100

# Update SSL certificate
sudo certbot renew

# Check domain DNS
nslookup yourdomain.com
```

---

## Summary

After following this guide, you'll have:

✅ Public domain pointing to your server
✅ HTTPS/SSL configured
✅ Backend API running at `https://api.yourdomain.com`
✅ Frontend running at `https://yourdomain.com`
✅ Production database (MongoDB Atlas)
✅ Production cache (Redis)
✅ Automatic process management (PM2)
✅ Reverse proxy with Nginx
✅ Security headers configured
✅ Auto-renewal SSL certificates

---

**Your SMM Panel is now PUBLIC! 🌐**

---

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review logs carefully
3. Verify environment variables
4. Test each component individually
5. Check firewall rules

---

**Version**: 1.0  
**Last Updated**: 2024
