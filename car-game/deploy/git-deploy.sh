#!/bin/bash

# Git-based deployment script for LLev's Car Game
set -e

echo "🚗 Git-based deployment of LLev's Car Game..."

# Configuration
BRANCH=${1:-main}  # Default to main branch, can be overridden
REMOTE=${2:-origin}  # Default to origin remote

# Check current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $CURRENT_BRANCH"

# Fetch latest changes
echo "📥 Fetching latest changes from $REMOTE..."
git fetch $REMOTE

# Check if we need to switch branches
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    echo "🔄 Switching to $BRANCH branch..."
    git checkout $BRANCH
fi

# Check if there are local changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Warning: You have uncommitted changes."
    read -p "Stash them and continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git stash
        STASHED=true
    else
        echo "Deployment cancelled."
        exit 1
    fi
fi

# Check if we're behind remote
LOCAL=$(git rev-parse @)
REMOTE_COMMIT=$(git rev-parse $REMOTE/$BRANCH)

if [ "$LOCAL" != "$REMOTE_COMMIT" ]; then
    echo "🔄 Pulling latest changes from $REMOTE/$BRANCH..."
    git pull $REMOTE $BRANCH
else
    echo "✅ Already up to date with $REMOTE/$BRANCH"
fi

# Restore stashed changes if any
if [ "$STASHED" = true ]; then
    echo "📦 Restoring stashed changes..."
    git stash pop
fi

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo "📦 Installing dependencies..."
    yarn install
fi

# Build the application
echo "📦 Building the application..."
yarn build

# Create deployment directory
DEPLOY_DIR="/var/www/car-game"
echo "📁 Preparing deployment directory: $DEPLOY_DIR"
sudo mkdir -p $DEPLOY_DIR

# Backup current deployment (optional)
if [ -d "$DEPLOY_DIR" ] && [ "$(ls -A $DEPLOY_DIR)" ]; then
    echo "💾 Creating backup of current deployment..."
    sudo cp -r $DEPLOY_DIR "${DEPLOY_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Copy built files
echo "📋 Copying built files..."
sudo cp -r dist/* $DEPLOY_DIR/

# Set permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data $DEPLOY_DIR
sudo chmod -R 755 $DEPLOY_DIR

# Reload nginx
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

# Show deployment info
echo ""
echo "✅ Deployment completed successfully!"
echo "🌐 Your car game should now be live!"
echo "📊 Deployment info:"
echo "   - Branch: $BRANCH"
echo "   - Commit: $(git rev-parse --short HEAD)"
echo "   - Date: $(date)"
echo "   - Deployed to: $DEPLOY_DIR"

# Cleanup old backups (keep last 5)
echo "🧹 Cleaning up old backups..."
sudo find /var/www -name "car-game.backup.*" -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true 