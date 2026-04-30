# PM2 Deployment Guide

## Installation

```bash
# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version
```

## Configuration Files

### ecosystem.config.js

```javascript
module.exports = {
  apps: [{
    name: 'zymi-server',
    script: 'index.js',
    cwd: './server',
    instances: 1,
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      CLIENT_ORIGIN: 'https://your-domain.com'
    },
    autorestart: true,
    error_file: 'logs/zymi-server-error.log',
    out_file: 'logs/zymi-server-out.log',
    log_file: 'logs/zymi-server-combined.log',
    merge_logs: true
  }]
};
```

## Commands

### Start Server

```bash
# Development
pm2 start ecosystem.config.js --env development

# Production
pm2 start ecosystem.config.js --env production

# Or start with inline config
pm2 start index.js --name zymi-server --env production
```

### Manage Server

```bash
# View status
pm2 status

# View logs
pm2 logs zymi-server
pm2 logs zymi-server --err
pm2 logs zymi-server --lines 100

# Restart
pm2 restart zymi-server

# Stop
pm2 stop zymi-server

# Delete
pm2 delete zymi-server

# Reload (zero-downtime)
pm2 reload zymi-server --env production
```

### Save and Startup

```bash
# Save current process list
pm2 save

# Generate startup script
pm2 startup

# View all processes
pm2 list
pm2 jlist
```

## Process Management

### Logs

```bash
# Log files are in ~/.pm2/logs/

# Standard output
~/.pm2/logs/zymi-server-out.log

# Error output
~/.pm2/logs/zymi-server-error.log

# Real-time logs
pm2 logs zymi-server --raw

# Flush logs (clear old logs)
pm2 flush
```

### Monitoring

```bash
# CPU/Memory usage
pm2 monit

# Detailed info
pm2 info zymi-server
```

## Zero-Downtime Deploy

```bash
# Deploy with git
git add .
git commit -m "Deploy update"
git push origin main

# On server
pm2 reload zymi-server
```

## Docker vs PM2

| Aspect | Docker | PM2 |
|--------|--------|-----|
| Container | Isolated | Direct |
| Scaling | Built-in | Manual |
| Updates | Rebuild | Reload |
| Logs | Docker logs | PM2 logs |

Choose Docker for production with scaling.
Choose PM2 for simple VPS deployment.