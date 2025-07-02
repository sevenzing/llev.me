#!/bin/bash

# Deployment script for LLev's Car Game
set -e

echo "🚗 Starting deployment of LLev's Car Game..."

# Check if we're in a Git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a Git repository. Please clone the repository first."
    exit 1
fi

# Check for updates if on a branch that tracks remote
if git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
    echo "📥 Checking for updates..."
    git fetch origin
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u})
    
    if [ "$LOCAL" != "$REMOTE" ]; then
        echo "🔄 Updates found, pulling latest changes..."
        git pull origin $(git rev-parse --abbrev-ref HEAD)
    else
        echo "✅ Already up to date"
    fi
fi

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo "📦 Installing dependencies..."
    yarn install
fi

# Build the application
echo "📦 Building the application..."
yarn build

# Create deployment directory if it doesn't exist
DEPLOY_DIR="/var/www/car-game"
echo "📁 Preparing deployment directory: $DEPLOY_DIR"

# Create deployment directory with sudo
sudo mkdir -p $DEPLOY_DIR

# Copy built files to deployment directory
echo "📋 Copying built files..."
sudo cp -r dist/* $DEPLOY_DIR/

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data $DEPLOY_DIR
sudo chmod -R 755 $DEPLOY_DIR

# Reload nginx to ensure changes are served
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

echo "✅ Deployment completed successfully!"
echo "🌐 Your car game should now be accessible at your domain"
echo "📝 Don't forget to configure nginx (see nginx-config.conf)" 