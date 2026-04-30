# Docker Release Test Checklist

## Prerequisites

- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] Ports 5432, 6379, 5000, 5175 available

## Test Execution

### Start Services

```bash
docker compose up --build -d
```

### Verify Running

```bash
docker compose ps
```

Expected output:
```
NAME         IMAGE          STATUS          PORTS
zymi-client  zymi-client    Up (healthy)   0.0.0.0:5175->80/tcp
zymi-postgres zymi-postgres Up (healthy)   0.0.0.0:5432->5432/tcp
zymi-redis  zymi-redis    Up (healthy)   0.0.0.0:6379->6379/tcp
zymi-server zymi-server   Up (healthy)   0.0.0.0:5000->5000/tcp
```

### Health Checks

```bash
# Server health
curl http://localhost:5000/health

# Database health
curl http://localhost:5000/health/db

# Redis health
curl http://localhost:5000/health/redis
```

### Functional Tests

1. **Client loads at http://localhost:5175**

2. **User login works**
   - Register new user
   - Login with credentials

3. **Admin login works**
   - Login as admin

4. **Chat loads**
   - Select another user
   - Load message history

5. **Real-time messaging**
   - Open two browser tabs
   - Send private message
   - Verify instant delivery

6. **Typing indicator**
   - Type in one tab
   - Verify "typing" shows in other tab

7. **Audio call**
   - Initiate audio call
   - Verify call UI appears

8. **Video call**
   - Initiate video call
   - Verify video streams

9. **Block user**
   - Block a user
   - Verify blocking works

10. **Reports**
    - Report a message
    - Verify report submitted

11. **Avatar upload**
    - Upload avatar image
    - Verify avatar displays

### Cleanup

```bash
docker compose down
```

## Known Issues

- First run may take 2-3 minutes due to build
- PostgreSQL init adds ~30 seconds on first run
- Redis may show warning but continues working

## Performance Benchmarks

| Metric | Expected |
|--------|----------|
| Client load time | < 5 seconds |
| Login response | < 500ms |
| Message delivery | < 100ms |
| Health check | < 50ms |