# PostgreSQL Backup and Restore

## Backup Methods

### Method 1: Docker Compose Backup

```bash
# Create backup
docker compose exec -T postgres pg_dump -U zymi_user zymi_db > backup_$(date +%Y%m%d).sql

# Restore backup
docker compose exec -T postgres psql -U zymi_user zymi_db < backup_20240425.sql
```

### Method 2: Volume Snapshot

```bash
# Backup volume
docker compose run --rm -v postgres_data:/backup ubuntu tar czf /backup/backup.tar.gz /var/lib/postgresql/data

# Restore volume
docker compose down
docker volume rm zymi-postgres_data
docker volume create zymi-postgres_data
docker compose run --rm -v postgres_data:/restore ubuntu tar xzf /backup/backup.tar.gz -C /
```

### Method 3: S3/Cloud Backup

```bash
# Push to S3 (requires AWS CLI)
aws s3 cp backup.sql s3://your-bucket/backups/

# Pull from S3
aws s3 cp s3://your-bucket/backups/backup.sql .
```

## Scheduled Backups

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * docker compose exec -T postgres pg_dump -U zymi_user zymi_db | gzip > /backups/zymi_$(date +\%Y\%m%d).sql.gz
```

## Emergency Restore

If database is corrupted:
1. Stop server: `docker compose stop server`
2. Drop database: `docker compose exec postgres dropdb -U zymi_user zymi_db`
3. Recreate: `docker compose exec postgres createdb -U zymi_user zymi_db`
4. Restore: `cat backup.sql | docker compose exec -T postgres psql -U zymi_user zymi_db`
5. Start server: `docker compose start server`

## Verification

After restore:
```bash
# Check row counts
docker compose exec postgres psql -U zymi_user -d zymi_db -c "SELECT COUNT(*) FROM users;"
docker compose exec postgres psql -U zymi_user -d zymi_db -c "SELECT COUNT(*) FROM messages;"
```