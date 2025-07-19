#!/bin/bash

# Local build and deploy script for LLev's Car Game
# This script builds on your local machine and deploys to production via SCP

set -e

# Configuration - UPDATE THESE VALUES
REMOTE_HOST="car.llev.me"
REMOTE_USER="root"
REMOTE_PATH="/var/www/car-game"
SSH_KEY_PATH="~/.ssh/id_rsa"  # Path to your SSH key (optional)

echo "🚗 Local build and deploy for LLev's Car Game..."

# Check if we're in the project directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if yarn is available locally
if ! command -v yarn &> /dev/null; then
    echo "❌ Error: yarn not found. Please install yarn locally first."
    exit 1
fi

# Build the application locally
echo "📦 Building the application locally..."
yarn build

# Check if build was successful
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "❌ Error: Build failed. dist/index.html not found."
    exit 1
fi

echo "✅ Build completed successfully!"

# Create deployment archive
echo "📦 Creating deployment archive..."
DEPLOY_ARCHIVE="car-game-deploy-$(date +%Y%m%d_%H%M%S).tar.gz"
tar -czf "$DEPLOY_ARCHIVE" -C dist .

echo "📋 Uploading to production server..."

# Upload to production server
if [ -n "$SSH_KEY_PATH" ] && [ -f "$SSH_KEY_PATH" ]; then
    # Use SSH key
    scp -i "$SSH_KEY_PATH" "$DEPLOY_ARCHIVE" "$REMOTE_USER@$REMOTE_HOST:/tmp/"
else
    # Use password authentication
    scp "$DEPLOY_ARCHIVE" "$REMOTE_USER@$REMOTE_HOST:/tmp/"
fi

echo "📋 Extracting and deploying on production server..."

# Deploy on production server
if [ -n "$SSH_KEY_PATH" ] && [ -f "$SSH_KEY_PATH" ]; then
    # Use SSH key
    ssh -i "$SSH_KEY_PATH" "$REMOTE_USER@$REMOTE_HOST" << 'EOF'
        # Create backup of current deployment
        if [ -d "/var/www/car-game" ] && [ "$(ls -A /var/www/car-game)" ]; then
            echo "💾 Creating backup of current deployment..."
            sudo cp -r /var/www/car-game "/var/www/car-game.backup.$(date +%Y%m%d_%H%M%S)"
        fi
        
        # Extract new deployment
        echo "📋 Extracting new deployment..."
        sudo mkdir -p /var/www/car-game
        sudo tar -xzf /tmp/car-game-deploy-*.tar.gz -C /var/www/car-game
        
        # Set permissions
        echo "🔐 Setting permissions..."
        sudo chown -R www-data:www-data /var/www/car-game
        sudo chmod -R 755 /var/www/car-game
        
        # Reload nginx
        echo "🔄 Reloading nginx..."
        sudo systemctl reload nginx
        
        # Cleanup
        echo "🧹 Cleaning up..."
        rm -f /tmp/car-game-deploy-*.tar.gz
        
        echo "✅ Deployment completed successfully!"
EOF
else
    # Use password authentication
    ssh "$REMOTE_USER@$REMOTE_HOST" << 'EOF'
        # Create backup of current deployment
        if [ -d "/var/www/car-game" ] && [ "$(ls -A /var/www/car-game)" ]; then
            echo "💾 Creating backup of current deployment..."
            sudo cp -r /var/www/car-game "/var/www/car-game.backup.$(date +%Y%m%d_%H%M%S)"
        fi
        
        # Extract new deployment
        echo "📋 Extracting new deployment..."
        sudo mkdir -p /var/www/car-game
        sudo tar -xzf /tmp/car-game-deploy-*.tar.gz -C /var/www/car-game
        
        # Set permissions
        echo "🔐 Setting permissions..."
        sudo chown -R www-data:www-data /var/www/car-game
        sudo chmod -R 755 /var/www/car-game
        
        # Reload nginx
        echo "🔄 Reloading nginx..."
        sudo systemctl reload nginx
        
        # Cleanup
        echo "🧹 Cleaning up..."
        rm -f /tmp/car-game-deploy-*.tar.gz
        
        echo "✅ Deployment completed successfully!"
EOF
fi

# Cleanup local archive
echo "🧹 Cleaning up local archive..."
rm -f "$DEPLOY_ARCHIVE"

echo ""
echo "✅ Local build and deploy completed successfully!"
echo "🌐 Your car game should now be live at your domain!"
echo "📊 Deployment info:"
echo "   - Built locally: $(date)"
echo "   - Deployed to: $REMOTE_HOST:$REMOTE_PATH" 