# PostgreSQL Migration Checklist

## Pre-Migration

- [ ] Backup ovyo.db (already done in backups/)
- [ ] Backup full project (already done in backups/)
- [ ] Verify SQLite database works

## Migration Steps

1. **Start PostgreSQL and Redis via Docker**
   ```bash
   docker compose up -d postgres redis
   ```

2. **Wait for PostgreSQL to be ready**
   ```bash
   docker compose ps
   # Wait until postgres shows "healthy"
   ```

3. **Create PostgreSQL schema**
   ```bash
   docker compose exec -T postgres psql -U zymi_user -d zymi_db < server/migrations/postgres/001_initial_schema.sql
   ```

4. **Run migration script**
   ```bash
   docker compose run --rm server node scripts/migrate-sqlite-to-postgres.js
   ```

5. **Verify row counts match**

6. **Switch server to PostgreSQL**
   - Set DATABASE_URL in environment
   - Server will automatically use PostgreSQL

## Post-Migration Verification

- [ ] User login works
- [ ] Admin login works
- [ ] Chat history loads
- [ ] Private messages work in real-time
- [ ] Typing indicator works
- [ ] Audio calls work
- [ ] Video calls work
- [ ] Block user works
- [ ] Reports work
- [ ] Avatar upload works
- [ ] Call history writes to PostgreSQL

## Rollback Plan

If migration fails:
1. Unset DATABASE_URL
2. Server reverts to SQLite automatically
3. Investigate issue
4. Fix and re-run migration

## Important Notes

- SQLite database (ovyo.db) is NEVER deleted
- Migration preserves all user IDs
- Messages, blocks, reports, call history are migrated
- Metrics are migrated