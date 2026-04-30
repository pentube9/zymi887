# Scaling Socket.io with Redis

## Overview

The Redis adapter enables Socket.io to work across multiple server instances, enabling horizontal scaling.

## Architecture

```
[Client 1] --- [Server 1] --- [Redis] --- [Server 2] --- [Client 2]
              \                           /
               \_________ Redis ________/
```

## How It Works

1. **Pub/Sub**: Redis handles message broadcasting between servers
2. **Namespace**: Socket.io uses Redis channels for events
3. **Adapter**: Each serverinstance subscribes to Redis

## Events Synchronized

- `join` - User joining
- `private-message` - Messages broadcast
- `typing` / `stop-typing` - Typing indicators
- `call-*` - WebRTC signaling
- `ice-candidate` - ICE candidates

## Events NOT Synchronized (Local Only)

These stay local to the originating server:
- `connection` - Per-socket
- `disconnect` - Per-socket

## Configuration

```javascript
// server/src/socket/redisAdapter.js
import { initRedis } from './src/socket/redisAdapter.js';

const redisResult = await initRedis(io);
if (redisResult.adapter) {
  io.adapter(redisResult.adapter);
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Redis connection string |

## Fallback Behavior

Without Redis:
- Server runs in single-instance mode
- All features work normally
- Cannot scale horizontally

## Health Check

```bash
curl http://localhost:5000/health/redis
```

## Performance Notes

- Redis adds ~1-2ms latency for cross-server events
- Connection pooling recommended
- Consider Redis Cluster for high availability