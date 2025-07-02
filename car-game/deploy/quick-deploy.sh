#!/bin/bash

# Quick deployment script - assumes build is already done
set -e

echo "🚗 Quick deployment of LLev's Car Game..."

# Check if we're in a Git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a Git repository. Please clone the repository first."
    exit 1
fi

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found. Run 'yarn build' first."
    exit 1
fi

# Check if dist is older than source files (optional safety check)
if [ "src" -nt "dist" ] || [ "package.json" -nt "dist" ]; then
    echo "⚠️  Warning: Source files are newer than dist. Consider running 'yarn build' first."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

# Deployment directory
DEPLOY_DIR="/var/www/car-game"

# Create deployment directory
echo "📁 Preparing deployment directory: $DEPLOY_DIR"
sudo mkdir -p $DEPLOY_DIR

# Copy built files
echo "📋 Copying built files..."
sudo cp -r dist/* $DEPLOY_DIR/

# Set permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data $DEPLOY_DIR
sudo chmod -R 755 $DEPLOY_DIR

echo "✅ Quick deployment completed!"
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

echo "🌐 Your car game should now be live!" 