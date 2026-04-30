# SSL_HTTPS_SETUP.md

# SSL/HTTPS Setup Guide

## Overview

For production, HTTPS is required for:
- getUserMedia (camera/mic)
- Secure cookies
- Secure WebSocket (WSS)

## Option 1: Certbot (Recommended)

### Install Certbot

```bash
# Ubuntu
sudo apt install certbot python3-certbot-nginx
```

### Get Certificate

```bash
# For your domain
sudo certbot --nginx -d your-domain.com
```

### Auto-renewal

```bash
sudo certbot renew --dry-run
```

## Option 2: Self-Signed (Development Only)

```bash
# Generate certificate
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes

# In Nginx config
ssl_certificate cert.pem;
ssl_certificate_key key.pem;
```

## Nginx HTTPS Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/zymi/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
    }

    # Socket.io with WSS
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Client Configuration

For production, update:
```javascript
// Socket.io connection
const socket = io('https://your-domain.com', {
  auth: { token },
  transports: ['websocket', 'polling']
});
```

## Environment Variables

```bash
# server/.env.production
NODE_ENV=production
CLIENT_ORIGIN=https://your-domain.com
```

## Do NOT Change

- Socket event names
- Message payload shapes
- WebRTC flow