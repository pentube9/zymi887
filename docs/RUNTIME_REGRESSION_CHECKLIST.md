# Runtime Regression Checklist

## Pre-Flight Checks

- [ ] Server starts without errors
- [ ] Port 5000 is listening
- [ ] Health endpoints respond

## Authentication Tests

### User Login

1. Register new user
2. Login with credentials
3. Verify JWT token returned
4. Verify user object stored in localStorage

### Admin Login

1. Go to /exclusivesecure/login
2. Login with admin credentials
3. Verify redirect to admin panel
4. Verify admin object stored

### JWT Token

1. Copy token from localStorage
2. Call API with Authorization header
3. Verify request succeeds
4. Verify token contains userId

## Socket.io Tests

### Socket Connection

1. Open browser to http://localhost:5175
2. Login as user
3. Check console for connection
4. Verify socket connected

### Token Passing

1. Check socket auth object
2. Verify token is sent in auth
3. Verify server accepts connection

### Authentication Errors

1. Invalidate token (change password)
2. Try to connect with old token
3. Verify auth-error emitted
4. Verify socket disconnected

## Chat Tests

### Send Message

1. Open two browser tabs
2. Login as different users
3. Send private message from tab 1
4. Verify message received in tab 2

### Message Properties

1. Verify message has id
2. Verify sender_id correct
3. Verify receiver_id correct
4. Verify content correct
5. Verify timestamp

### Typing Indicator

1. Start typing in tab 1
2. Verify "typing" shows in tab 2
3. Stop typing
4. Verify "stop-typing" in tab 2

### Read Receipt

1. Send message to user
2. Mark as read
3. Verify is_read = true

## Call Tests

### Audio Call

1. Initiate audio call
2. Accept in other tab
3. Verify call connects
4. End call
5. Verify call ended in both tabs

### Video Call

1. Initiate video call
2. Accept in other tab
3. Verify video streams
4. End call

### Call Timeout

1. Initiate call
2. Wait for timeout
3. Verify call-timeout emitted
4. Verify call rejected

### Call History

1. Check /api/calls/:userId
2. Verify call recorded
3. Verify duration calculated

## WebRTC Flow

### Offer/Answer

1. Caller creates offer
2. Verify offer sent to callee
3. Callee creates answer
4. Verify answer sent to caller
5. Verify peer connections established

### ICE Candidates

1. Generate ICE candidate
2. Verify sent to peer
3. Verify received by peer
4. Verify ICE exchange works

## Database Tests

### SQLite

1. Check ovyo.db exists
2. Verify tables created
3. Query users table
4. Query messages table

### PostgreSQL

1. Check /health/db
2. Verify connected: true
3. Create test user
4. Verify user in database

### Read/Write

1. Send message via API
2. Verify in database
3. Send message via socket
4. Verify in database

## Redis Tests

### Adapter

1. Check /health/redis
2. Verify adapter: socket.io-redis
3. Verify connected: true

### Scaling

1. Start second server instance
2. Connect to different server
3. Send message
4. Verify message broadcast

## PM2 Tests

### Start

```bash
pm2 start ecosystem.config.js --env production
```

### Status

```bash
pm2 status
# Verify online
```

### Logs

```bash
pm2 logs zymi-server
# Verify no errors
```

### Restart

```bash
pm2 restart zymi-server
# Verify restart successful
```

### Save

```bash
pm2 save
# Verify saved
```

## Docker Tests

### Build

```bash
docker compose build
```

### Run

```bash
docker compose up -d
```

### Verify

```bash
docker compose ps
# All healthy
```

### Health Endpoints

```bash
curl http://localhost:5000/health
curl http://localhost:5000/health/db
curl http://localhost:5000/health/redis
```

### Logs

```bash
docker compose logs server
# Verify no errors
```

## Mobile Tests

### Layout

1. Open in mobile browser
2. Verify responsive layout
3. Test touch interactions
4. Test video call on mobile

### Notifications

1. Send message to mobile user
2. Verify notification works
3. Test audio call notification
4. Test video call notification

## Security Tests

### Rate Limiting

1. Try 10+ login attempts quickly
2. Verify rate limited
3. Check error message

### CORS

1. Try request from wrong origin
2. Verify blocked
3. Verify correct origin allowed

### JWT Expiration

1. Set short JWT_EXPIRES_IN
2. Wait for expiration
3. Verify token expired error

### Token Version

1. Change password
2. Try reconnect with old token
3. Verify disconnected

## Performance Tests

### Response Times

| Action | Target | Actual |
|--------|--------|--------|
| Login | < 500ms | |
| Message send | < 100ms | |
| Health check | < 50ms | |
| Page load | < 2s | |

### Concurrent Users

Test with 2+ users messaging simultaneously.

## Debug Commands

```bash
# Server logs
pm2 logs zymi-server

# Docker logs
docker compose logs server

# Socket.io debug
DEBUG=socket.io* node index.js

# PostgreSQL logs
docker compose logs postgres

# Redis logs
docker compose logs redis
```