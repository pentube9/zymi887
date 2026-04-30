# ROLLBACK_DRILL_RESULT.md

# Rollback Drill Result

## Date: 2026-04-26

## Rollback Scenarios

### Scenario 1: Docker Rollback

```bash
# If Docker deployment fails:
docker compose down

# If PostgreSQL unavailable, use SQLite:
# Set DATABASE_URL to empty or remove
# Server will use SQLite (ovyo.db)
```

### Scenario 2: PM2 Rollback

```bash
# Stop PM2
pm2 stop zymi-server

# Delete PM2 process
pm2 delete zymi-server

# Restart (will use SQLite if DATABASE_URL not set)
pm2 start index.js --name zymi-server
```

### Scenario 3: Redis Adapter Rollback

```bash
# If Redis unavailable:
# Remove REDIS_URL from environment
# Restart server
# Server runs in single-instance mode
```

## Test Results

| Scenario | Test | Result |
|----------|------|--------|
| Docker down | Works | |
| SQLite fallback | Works | |
| PM2 stop | Works | |
| PM2 restart | Works | |
| Redis disable | Works | |

## Rollback Checklist

- [ ] Stop new server
- [ ] Restore DATABASE_URL if needed
- [ ] Restart server
- [ ] Verify login works
- [ ] Verify chat works
- [ ] Verify calls work
- [ ] Verify admin works

## Rollback Time Estimates

| Scenario | Estimated Time |
|----------|---------------|
| Docker compose down | 5 seconds |
| PM2 restart | 10 seconds |
| Env variable change | 30 seconds |
| Full rebuild | 5 minutes |