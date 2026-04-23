#!/bin/bash
# 🌐 SMM Panel - Public Deployment Script
# This script helps you quickly set up SMM Panel for public access

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   SMM Panel - Public Deployment Setup${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"

# Get domain name
echo -e "\n${YELLOW}Enter your domain name (e.g., yourdomain.com):${NC}"
read DOMAIN

if [ -z "$DOMAIN" ]; then
    echo "Domain cannot be empty!"
    exit 1
fi

API_DOMAIN="api.$DOMAIN"

echo -e "\n${GREEN}✓ Domain set to: $DOMAIN${NC}"
echo -e "${GREEN}✓ API endpoint: $API_DOMAIN${NC}"

# Create production .env files
echo -e "\n${YELLOW}Creating production .env files...${NC}"

# Backend .env
cat > backend/.env << EOF
# Production Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smm-panel
PORT=5000
NODE_ENV=production
SERVER_URL=https://$API_DOMAIN
FRONTEND_URL=https://$DOMAIN

# JWT Secret (Generate strong key)
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRE=7d

# Redis
REDIS_URL=redis://localhost:6379

# CORS
ALLOWED_ORIGINS=https://$DOMAIN,https://www.$DOMAIN

# SSL Paths
SSL_CERT_PATH=/etc/letsencrypt/live/$DOMAIN/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/$DOMAIN/privkey.pem
EOF

echo -e "${GREEN}✓ Backend .env created${NC}"

# Frontend .env.production
cat > frontend/.env.production << EOF
NEXT_PUBLIC_API_URL=https://$API_DOMAIN
NEXT_PUBLIC_APP_URL=https://$DOMAIN
NEXT_PUBLIC_ENV=production
EOF

echo -e "${GREEN}✓ Frontend .env.production created${NC}"

# Summary
echo -e "\n${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Update MongoDB URI in backend/.env"
echo -e "   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smm-panel"
echo -e "\n2. Update Redis URL if not local"
echo -e "   REDIS_URL=redis://:password@server.com:6379"
echo -e "\n3. Setup SSL certificate:"
echo -e "   sudo certbot certonly --standalone -d $DOMAIN -d $API_DOMAIN"
echo -e "\n4. Setup Nginx (see docs/PUBLIC_DEPLOYMENT.md)"
echo -e "\n5. Deploy:"
echo -e "   cd backend && npm install && pm2 start src/index.js"
echo -e "   cd frontend && npm install && npm run build && pm2 start 'npm start'"
echo -e "\n6. Point your domain DNS to your server IP"

echo -e "\n${GREEN}Configuration files ready in:${NC}"
echo -e "  Backend:  backend/.env"
echo -e "  Frontend: frontend/.env.production"
echo -e "\n${YELLOW}Full guide: docs/PUBLIC_DEPLOYMENT.md${NC}"
