# 🚗 LLev's Car Game - Deployment Guide

This guide will help you deploy the car game to your Ubuntu server with nginx using Git.

## Prerequisites

- Ubuntu server with nginx installed
- Domain name with DNS configured
- SSL certificates (Let's Encrypt recommended)
- Git repository with your car game code

## Step 1: Server Setup

1. **Run the server setup script:**
   ```bash
   chmod +x server-setup.sh
   ./server-setup.sh
   ```

2. **Clone your repository:**
   ```bash
   git clone <your-repository-url>
   cd car-react
   ```

## Step 2: Configure Nginx

1. **Edit the nginx configuration:**
   ```bash
   sudo nano /etc/nginx/sites-available/car-game
   ```

2. **Copy the content from `nginx-config.conf` and update:**
   - Replace `your-domain.com` with your actual domain
   - Update SSL certificate paths if different
   - Adjust any other settings as needed

3. **Enable the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/car-game /etc/nginx/sites-enabled/
   sudo nginx -t  # Test configuration
   sudo systemctl reload nginx
   ```

## Step 3: Deploy the Application

### Option A: Using the deployment script (Recommended)
```bash
# In your project directory
chmod +x deploy.sh
./deploy.sh
```

This script will:
- Check for Git updates and pull if needed
- Install dependencies if required
- Build the application
- Deploy to `/var/www/car-game`
- Set proper permissions
- Reload nginx

### Option B: Quick deployment (if build is already done)
```bash
chmod +x quick-deploy.sh
./quick-deploy.sh
```

### Option C: Manual deployment
```bash
# Pull latest changes
git pull origin main

# Install dependencies
yarn install

# Build the application
yarn build

# Create deployment directory
sudo mkdir -p /var/www/car-game

# Copy files
sudo cp -r dist/* /var/www/car-game/

# Set permissions
sudo chown -R www-data:www-data /var/www/car-game
sudo chmod -R 755 /var/www/car-game

# Reload nginx
sudo systemctl reload nginx
```

## Step 4: SSL Certificate (if not already configured)

If you don't have SSL certificates yet:

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 5: Test Your Deployment

1. Visit your domain in a browser
2. Test all game features
3. Check browser console for any errors
4. Verify HTTPS is working

## Step 6: Set Up Auto-Deployment (Optional)

### Option A: GitHub Actions (Recommended)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Server

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: yarn install
    
    - name: Build
      run: yarn build
    
    - name: Deploy to server
      uses: appleboy/scp-action@v0.1.4
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        source: "dist/*"
        target: "/tmp/car-game/"
    
    - name: Execute deployment script
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          sudo cp -r /tmp/car-game/* /var/www/car-game/
          sudo chown -R www-data:www-data /var/www/car-game
          sudo chmod -R 755 /var/www/car-game
          sudo systemctl reload nginx
```

### Option B: Git Hooks (Server-side)
Create a post-receive hook for automatic deployment:

```bash
# On your server, in the bare repository
mkdir -p /home/user/car-game-bare.git
cd /home/user/car-game-bare.git
git init --bare

# Create post-receive hook
cat > hooks/post-receive << 'EOF'
#!/bin/bash
DEPLOY_DIR="/home/user/car-game"
WORK_TREE="/home/user/car-game"

if [ -d "$WORK_TREE" ]; then
    cd "$WORK_TREE"
    git pull origin main
    yarn install
    yarn build
    sudo cp -r dist/* /var/www/car-game/
    sudo chown -R www-data:www-data /var/www/car-game
    sudo chmod -R 755 /var/www/car-game
    sudo systemctl reload nginx
    echo "Deployment completed!"
else
    echo "Work tree not found: $WORK_TREE"
fi
EOF

chmod +x hooks/post-receive
```

### Option C: Cron Job
Set up automatic deployment every few minutes:

```bash
# Edit crontab
crontab -e

# Add this line to check for updates every 5 minutes
*/5 * * * * cd /home/user/car-react && git fetch origin && git diff --quiet origin/main || (git pull origin main && ./deploy.sh)
```

## Step 7: Update Workflow

### For regular updates:
```bash
# On your local machine
git add .
git commit -m "Update game features"
git push origin main

# On your server
cd /path/to/car-react
./deploy.sh
```

### For hotfixes:
```bash
# On your server
cd /path/to/car-react
git pull origin main
./quick-deploy.sh
```

## Troubleshooting

### Common Issues:

1. **403 Forbidden:**
   - Check file permissions: `sudo chown -R www-data:www-data /var/www/car-game`
   - Check nginx user: `sudo nginx -t`

2. **404 Not Found:**
   - Verify the root path in nginx config
   - Check if files exist in `/var/www/car-game`

3. **SSL Issues:**
   - Verify certificate paths in nginx config
   - Check certificate validity: `sudo certbot certificates`

4. **Git Issues:**
   - Check if you're in the right branch: `git branch`
   - Check remote configuration: `git remote -v`
   - Check for conflicts: `git status`

5. **Build Issues:**
   - Clear node_modules: `rm -rf node_modules && yarn install`
   - Check for dependency conflicts: `yarn why <package-name>`

### Useful Commands:

```bash
# Check nginx status
sudo systemctl status nginx

# View nginx logs
sudo tail -f /var/log/nginx/car-game-error.log

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Check Git status
git status
git log --oneline -5

# Check build output
ls -la dist/
```

## Performance Optimization

1. **Enable nginx caching:**
   - Static assets are already configured for 1-year caching
   - Consider adding Redis for dynamic content if you add a backend

2. **Compression:**
   - Gzip is already enabled in the nginx config

3. **CDN:**
   - Consider using a CDN for global distribution

## Security Considerations

- The nginx config includes security headers
- Hidden files are denied access
- SSL is configured with secure protocols
- Consider adding rate limiting for API endpoints
- Keep your Git repository secure with proper access controls

## Maintenance

- Regularly update dependencies: `yarn upgrade`
- Monitor nginx logs for errors
- Keep SSL certificates renewed
- Backup your deployment directory regularly
- Keep your Git repository clean and organized 