# Nginx Reverse Proxy Guide

## Overview

Nginx can serve as a reverse proxy to handle:
- SSL termination
- Static file serving
- Load balancing
- WebSocket proxying

## Basic Configuration

### Server Block (Virtual Host)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend static files
    location / {
        root /var/www/zymi/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.io proxy (critical!)
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
```

## WebSocket Headers (Critical)

The following headers are REQUIRED for Socket.io:

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

Without these, WebSocket connections will fail.

## SSL/HTTPS Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # ... rest of config
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Load Balancing

```nginx
upstream zymi_backend {
    server localhost:5000;
    server localhost:5001;
    server localhost:5002;
}

server {
    location / {
        proxy_pass http://zymi_backend;
        # ... proxy headers
    }
}
```

## Socket.io with Redis Adapter

When using Socket.io with Redis adapter behind Nginx:

```nginx
location /socket.io {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    
    # Required for Redis adapter
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    
    # Longer timeout for WebSocket
    proxy_read_timeout 86400;
    proxy_send_timeout 86400;
}
```

## Common Issues

### Issue: WebSocket Connection Fails

**Solution:** Ensure upgrade headers are set

### Issue: Socket.io Reconnects Repeatedly

**Solution:** Check proxy_read_timeout and proxy_send_timeout

### Issue: CORS Errors

**Solution:** Set proper proxy_set_header for Origin

### Issue: Long-polling Fails

**Solution:** Use HTTP/1.1 (not HTTP/1.0)

## Testing

```bash
# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Check logs
sudo tail -f /var/log/nginx/error.log
```

## Performance Tips

1. Enable gzip compression
2. Set proper keepalive timeout
3. Use buffer sizes appropriately
4. Enable caching for static files