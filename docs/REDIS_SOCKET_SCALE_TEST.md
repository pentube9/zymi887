# REDIS_SOCKET_SCALE_TEST.md

# Redis Socket.io Multi-Instance Test

## Timestamp

Date: 2026-04-26

## Test Setup

Requires:
- Redis running
- Two server instances

```bash
# Start Redis
docker compose up -d redis

# Start first server instance
PORT=5000 node server/index.js

# Start second server instance (on different port)
PORT=5001 node server/index.js
```

## Test Cases

### Test 1: Cross-Instance Messaging

1. User A connects to instance 1 (port 5000)
2. User B connects to instance 2 (port 5001)
3. User A sends private message to User B

Expected: Message received by User B despite different instances
- [ ] PASS

### Test 2: Cross-Instance Typing

1. User A on instance 1 starts typing
2. User B on instance 2 receives typing indicator

Expected: Typing crosses instances
- [ ] PASS

### Test 3: Cross-Instance Call Signaling

1. User A on instance 1 initiates call to User B
2. User B on instance 2 receives incoming-call

Expected: Call signaling crosses instances
- [ ] PASS

### Test 4: Cross-Instance ICE Exchange

1. Caller on instance 1 generates ICE candidate
2. Callee on instance 2 receives ICE candidate

Expected: ICE candidates cross instances
- [ ] PASS

## Test Summary

| Test | Status |
|------|--------|
| Cross-instance message | |
| Cross-instance typing | |
| Cross-instance call | |
| Cross-instance ICE | |

## Notes

- Redis adapter handles transport only
- Socket event names unchanged
- Payload shapes unchanged