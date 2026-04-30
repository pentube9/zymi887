# QiBo Production Nginx Deployment Guide

## Overview
This guide covers setting up Nginx as a reverse proxy with HTTPS support for production deployment of QiBo.

## Prerequisites
- SSL certificate and private key
- Domain name configured
- QiBo application built (`npm run build` in client directory)
- Docker Compose environment

## SSL Certificate Setup
Place your SSL certificate files in the `ssl/` directory:
```
ssl/
├── cert.pem    # SSL certificate
└── key.pem     # Private key
```

## Environment Variables
Set these in your `.env` file:
```bash
# Nginx Configuration
SERVER_NAME=your-domain.com
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
SSL_CERT_PATH=./ssl/cert.pem
SSL_KEY_PATH=./ssl/key.pem

# Upstream Services
UPSTREAM_API=server:5000
```

## Docker Compose Deployment
```bash
# Build the client first
cd client && npm run build

# Deploy with production compose
docker-compose -f docker-compose.prod.yml up -d
```

## Nginx Configuration Features
- HTTP to HTTPS redirect
- SSL/TLS encryption
- API proxy to backend server
- Socket.io WebSocket proxy
- React SPA routing support
- Static asset caching
- Security headers
- 50MB upload limit

## Testing
1. HTTP redirect: `curl -I http://your-domain.com` → 301 to HTTPS
2. HTTPS access: `curl https://your-domain.com`
3. API health: `curl https://your-domain.com/api/health`
4. Socket.io: Check WebSocket connection in browser dev tools
5. SPA routing: Navigate to `/admin`, `/dashboard` without 404

## Troubleshooting
- Check nginx logs: `docker-compose logs nginx`
- Test config: `docker-compose exec nginx nginx -t`
- SSL issues: Verify certificate paths and permissions

## Rollback
If issues occur:
```bash
# Remove nginx and expose client directly
docker-compose -f docker-compose.prod.yml up -d --scale nginx=0
docker-compose -f docker-compose.prod.yml up -d client
# Update VITE_API_URL to direct server port
```

## Security Notes
- SSL certificates must be valid and not expired
- Private key permissions should be 600
- Domain must match certificate CN/SAN
- Monitor nginx access/error logs for security issues