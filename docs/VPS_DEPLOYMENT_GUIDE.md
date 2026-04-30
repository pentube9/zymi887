# VPS Deployment Guide

## Prerequisites

- Ubuntu 20.04+ or similar Linux
- Root or sudo access
- Domain pointing to server IP

## Step 1: Install Node.js

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

## Step 2: Install PostgreSQL

```bash
# Install
sudo apt install -y postgresql postgresql-contrib

# Start
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create user and database
sudo -u postgres createuser -s zymi_user
sudo -u postgres createdb zymi_db

# Set password
sudo -u postgres psql
ALTER USER zymi_user WITH PASSWORD 'your_password';
\q
```

## Step 3: Install Redis

```bash
# Install
sudo apt install -y redis-server

# Start
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify
redis-cli ping
```

## Step 4: Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify
pm2 --version
```

## Step 5: Deploy Application

```bash
# Clone repository
cd /var/www
git clone https://github.com/your-org/your-repo.git zymi
cd zymi

# Install dependencies
cd server && npm install --production

# Copy and configure environment
cp server/.env.example server/.env
nano server/.env
```

## Step 6: Database Setup

```bash
# Create database schema
# If using PostgreSQL
psql -U zymi_user -d zymi_db -f migrations/postgres/001_initial_schema.sql

# If using SQLite (ovyo.db will be created on first run)
# No setup needed
```

## Step 7: Start with PM2

```bash
# Start server
cd server
pm2 start index.js --name zymi-server --env production

# Setup startup script
pm2 startup
pm2 save
```

## Step 8: Configure Nginx

```bash
# Install nginx
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/zymi
```

Add to /etc/nginx/sites-available/zymi:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/zymi /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## Step 9: Verify

```bash
# Health checks
curl http://localhost:5000/health
curl http://localhost:5000/health/db
curl http://localhost:5000/health/redis
```

## Maintenance

```bash
# View logs
pm2 logs zymi-server

# Restart
pm2 restart zymi-server

# Update code
cd /var/www/zymi
git pull
pm2 restart zymi-server
```

## Firewall (Optional)

```bash
# UFW setup
sudo apt install -y ufw
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```