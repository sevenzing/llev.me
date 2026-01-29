#!/bin/bash

# Configuration
DEPLOY_NAME=$1
DOMAIN="${DEPLOY_NAME}.dev.llev.me"
NGINX_CONF="/etc/nginx/sites-available/${DEPLOY_NAME}"
NGINX_LINK="/etc/nginx/sites-enabled/${DEPLOY_NAME}"

if [ -z "$DEPLOY_NAME" ]; then
    echo "Usage: $0 <deploy-name>"
    exit 1
fi

# 1. Stop and remove container
echo "Stopping and removing container $DEPLOY_NAME..."
docker stop "$DEPLOY_NAME" || true
docker rm "$DEPLOY_NAME" || true

# 2. Remove Nginx config
echo "Removing Nginx config for $DOMAIN..."
rm -f "$NGINX_LINK"
rm -f "$NGINX_CONF"

# 3. Reload Nginx
nginx -t && systemctl reload nginx

# 4. Optional: Remove SSL certs
# echo "Removing SSL certificates for $DOMAIN..."
# certbot delete --cert-name "$DOMAIN" --non-interactive || true

echo "Cleanup successful for $DEPLOY_NAME"
