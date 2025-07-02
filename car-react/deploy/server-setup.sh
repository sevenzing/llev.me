#!/bin/bash

# Server setup script for LLev's Car Game
# Run this on your Ubuntu server

set -e

echo "🚀 Setting up server environment for LLev's Car Game..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Git
echo "📦 Installing Git..."
sudo apt install git -y

# Install Node.js and Yarn
echo "📦 Installing Node.js and Yarn..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Yarn
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | sudo tee /usr/share/keyrings/yarnkey.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install yarn -y

# Install nginx if not already installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing nginx..."
    sudo apt install nginx -y
    sudo systemctl enable nginx
    sudo systemctl start nginx
fi

# Install Certbot for SSL
echo "📦 Installing Certbot for SSL certificates..."
sudo apt install certbot python3-certbot-nginx -y

# Create deployment directory
echo "📁 Creating deployment directory..."
sudo mkdir -p /var/www/car-game
sudo chown -R $USER:$USER /var/www/car-game

# Create nginx log directory
echo "📁 Creating nginx log directory..."
sudo mkdir -p /var/log/nginx

echo "✅ Server setup completed!"
echo ""
echo "📝 Next steps:"
echo "1. Clone your repository: git clone <your-repo-url>"
echo "2. cd into the project directory"
echo "3. Update the nginx configuration with your domain"
echo "4. Run: ./deploy.sh"
echo "5. Set up SSL certificates with: sudo certbot --nginx -d your-domain.com"
echo ""
echo "💡 For automatic deployments, consider setting up:"
echo "   - GitHub Actions (see DEPLOYMENT.md)"
echo "   - Git hooks for automatic deployment on push"
echo "   - Cron job to periodically pull and deploy" 