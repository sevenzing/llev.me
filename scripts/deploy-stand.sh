#!/bin/bash

# Configuration
DEPLOY_NAME=$1
IMAGE_TAG=$2
DOMAIN="${DEPLOY_NAME}.dev.llev.me"
NGINX_CONF="/etc/nginx/sites-available/${DEPLOY_NAME}"
NGINX_LINK="/etc/nginx/sites-enabled/${DEPLOY_NAME}"

if [ -z "$DEPLOY_NAME" ] || [ -z "$IMAGE_TAG" ]; then
    echo "Usage: $0 <deploy-name> <image-tag>"
    exit 1
fi

# 1. Find an available port
PORT=$(python3 -c 'import socket; s=socket.socket(); s.bind(("", 0)); print(s.getsockname()[1]); s.close()')
echo "Selected port: $PORT"

# 2. Stop and remove existing container if it exists
docker stop "$DEPLOY_NAME" || true
docker rm "$DEPLOY_NAME" || true

# 3. Build/Pull and Run the container
echo "Running container $DEPLOY_NAME on port $PORT..."
docker run -d \
    --name "$DEPLOY_NAME" \
    --restart always \
    -e PORT=3000 \
    -p "$PORT":3000 \
    "$IMAGE_TAG"

# 4. Create Nginx config
echo "Creating Nginx config at $NGINX_CONF..."
cat <<EOF > "$NGINX_CONF"
server {
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSockets support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    listen 80;
    listen [::]:80;
}
EOF

# 5. Enable Nginx config
ln -sf "$NGINX_CONF" "$NGINX_LINK"

# 6. Test and Reload Nginx
nginx -t && systemctl reload nginx

# 7. Obtain SSL certificate (non-interactive)
echo "Obtaining SSL certificate for $DOMAIN..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email webmaster@llev.me || echo "Certbot failed, but proceeding..."

# 8. Reload Nginx again just in case Certbot didn't do it
systemctl reload nginx

echo "Deployment successful: https://$DOMAIN"
