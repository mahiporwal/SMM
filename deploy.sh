#!/bin/bash

# SMM Panel Deployment Script
# Run this on your Ubuntu server to deploy the application

echo "🚀 Starting SMM Panel Deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
echo "📦 Installing MongoDB..."
sudo apt-get install gnupg
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Create project directory
echo "📁 Creating project directory..."
sudo mkdir -p /var/www/smm-panel
sudo chown -R $USER:$USER /var/www/smm-panel

# Copy project files (you need to upload them first)
echo "📋 Please upload your project files to /var/www/smm-panel"
echo "Then run the following commands manually:"
echo ""
echo "# Install backend dependencies"
echo "cd /var/www/smm-panel/backend && npm install --production"
echo ""
echo "# Install frontend dependencies"
echo "cd /var/www/smm-panel/frontend && npm install && npm run build"
echo ""
echo "# Configure environment variables"
echo "cp /var/www/smm-panel/.env.example /var/www/smm-panel/.env"
echo "# Edit .env with your actual values"
echo ""
echo "# Start applications with PM2"
echo "cd /var/www/smm-panel/backend && pm2 start src/index.js --name 'smm-backend'"
echo "cd /var/www/smm-panel/frontend && pm2 start npm --name 'smm-frontend' -- start"
echo ""
echo "# Save PM2 configuration"
echo "pm2 save && pm2 startup"
echo ""
echo "# Configure Nginx (create /etc/nginx/sites-available/smm-panel)"
echo "# Then: sudo ln -s /etc/nginx/sites-available/smm-panel /etc/nginx/sites-enabled/"
echo "# sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "# Get SSL certificate"
echo "sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"

echo "✅ Deployment script completed!"
echo "📖 Check the README.md for detailed setup instructions"