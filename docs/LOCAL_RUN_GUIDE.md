# Local Run Guide

## Quick Start

### Docker Run (Recommended)

```bash
docker compose up --build
```

**URLs:**
- Client: http://localhost:5175
- Server: http://localhost:5000/health
- DB Health: http://localhost:5000/health/db
- Redis Health: http://localhost:5000/health/redis

### Manual Run (Without Docker)

#### Prerequisites
- Node.js 20+
- npm

#### Server Setup
```bash
cd server
npm install
# Create .env file if needed (see below)
npm start
```

#### Client Setup
```bash
cd client
npm install
npm run dev
```

## Required .env Files

### server/.env
```
NODE_ENV=development
PORT=5000
DATABASE_URL=
REDIS_URL=
JWT_SECRET=local_dev_secret_change_later
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5175
SUPER_ADMIN_USERNAME=admin
SUPER_ADMIN_PASSWORD=admin123
```

### client/.env
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## URLs

| Service | URL |
|---------|-----|
| User Panel | http://localhost:5175 |
| Admin Panel | http://localhost:5175/exclusivesecure |
| Admin Login | http://localhost:5175/exclusivesecure/login |
| Server Health | http://localhost:5000/health |
| DB Health | http://localhost:5000/health/db |
| Redis Health | http://localhost:5000/health/redis |

**Note:** If ports are in use, Vite will auto-assign new ports (e.g., 5176, 5177).

## Common Issues

### Port Conflicts

- Port 3001/5000 in use: Find process `Get-NetTCPConnection -LocalPort 5000` and stop it
- Port 5175 in use: Vite auto-selects next available port

### Database Issues

- PostgreSQL not configured: Uses SQLite as fallback
- Run migrations: Already handled automatically on startup

### Redis Issues

- Redis not configured: Runs in single-instance mode (no horizontal scaling)

### Docker Issues

- PostgreSQL health check failing: Wait for container to be ready
- Redis health check failing: Wait for container to be ready
- Port conflicts with host: Check docker-compose.yml port mappings

## Network Notes

- Development: CORS allows all origins
- Production: CORS restricted to CLIENT_ORIGIN