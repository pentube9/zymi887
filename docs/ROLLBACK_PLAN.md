# Rollback Plan

## When to Rollback

Rollback immediately if:
- Server fails to start
- Database migrations fail
- Critical functionality broken (login, messaging, calls)
- Data corruption detected

## Rollback Steps

### Step 1: Stop Server

```bash
docker compose stop server
```

### Step 2: Disable PostgreSQL

Unset DATABASE_URL:
```bash
# In docker-compose.yml or .env
DATABASE_URL=
```

Or remove it entirely.

### Step 3: Restart Server

```bash
docker compose up -d server
```

The server will automatically fall back to SQLite (ovyo.db).

### Step 4: Verify

```bash
# Check server health
curl http://localhost:5000/health

# Verify SQLite is used
docker compose logs server | grep "SQLite"
```

### Step 5: Investigate & Fix

Common issues:
1. **PostgreSQL not ready** - Wait for "healthy" status
2. **Schema mismatch** - Re-run migrations
3. **Connection string** - Verify DATABASE_URL format
4. **Permissions** - Check user has correct grants

## Manual Database Restore

If PostgreSQL data is corrupted:

```bash
# Stop everything
docker compose down

# Remove PostgreSQL volume
docker volume rm zymi-postgres_data

# Start fresh
docker compose up -d postgres

# Wait for healthy
docker compose ps

# Recreate schema
docker compose exec -T postgres psql -U zymi_user -d zymi_db < server/migrations/postgres/001_initial_schema.sql

# Run migration from SQLite
docker compose run --rm server node scripts/migrate-sqlite-to-postgres.js
```

## Quick Rollback Command

```bash
# Single command rollback
docker compose stop server && unset DATABASE_URL && docker compose up -d server
```

## Recovery Time

| Scenario | Estimated Time |
|----------|----------------|
| Config rollback | 30 seconds |
| DB restore | 2-3 minutes |
| Full rebuild | 5 minutes |

## Emergency Contacts

- On-call: [TBD]
- DBA: [TBD]
- Platform: [TBD]