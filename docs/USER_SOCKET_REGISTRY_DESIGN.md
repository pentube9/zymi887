# User Socket Registry Design - Phase 4C Implementation

## Overview
The UserSocketRegistry provides a hybrid local/Redis approach to user socket management for multi-node scaling. This module is created but not yet wired into production socket routing.

## Architecture

### Core Components
- **Local Map**: Primary storage (userId → socketId)
- **Redis Client**: Optional distributed storage
- **Shadow Mode**: Write to both, read from local only
- **Health Metrics**: Operation tracking and diagnostics

### Design Principles
- **Local Primary**: All routing decisions use local Map
- **Redis Optional**: System works without Redis
- **Failure Isolation**: Redis errors never affect local operations
- **No Breaking Changes**: Existing socket flow unchanged

## API Reference

### Core Methods
- `setUserSocket(userId, socketId)` - Store mapping, shadow write if enabled
- `getUserSocket(userId)` - Retrieve from local Map only
- `deleteUserSocket(userId)` - Remove from both local and Redis
- `hasUserSocket(userId)` - Check local Map existence
- `getRegistryHealth()` - Return diagnostics data

### Shadow Mode Controls
- `enableShadowMode()` - Enable Redis shadow writing
- `disableShadowMode()` - Disable Redis operations

## Current Status

### Phase 4C: Helper Module Created
✅ **Created**: server/src/socket/userSocketRegistry.js
✅ **Not Wired**: No imports in production files
✅ **No Runtime Effects**: Import has no side effects
✅ **Shadow Mode Disabled**: Default state
✅ **Local Map Primary**: All operations use local Map

### Phase 4E: Shadow Write Implemented (Dev-Only)
✅ **Wired**: chatSocket.js JOIN and disconnect events
✅ **Dev-Only**: process.env.NODE_ENV !== 'production' check
✅ **Feature Flag**: REDIS_SOCKET_REGISTRY_SHADOW=true/false
✅ **Local Primary**: userSockets Map unchanged, routing unaffected
✅ **Error Isolation**: Redis failures logged, socket flow continues

### Files Untouched
✅ server/index.js - No registry initialization
✅ chatSocket.js - No registry calls
✅ callSocket.js - No registry calls
✅ Socket events - Names unchanged
✅ WebRTC flow - Logic preserved
✅ Dashboard.jsx - No changes
✅ SocketContext.jsx - No changes

## Shadow Mode Operation

### Write Operations
1. Always write to local Map
2. If shadow mode enabled + Redis available → also write to Redis
3. Redis failures logged but don't affect local operation

### Read Operations
1. Always read from local Map (primary)
2. If shadow mode enabled → compare with Redis for diagnostics
3. Redis comparison failures are non-critical

### Key Format
```
user_socket:{userId}
Value: {
  socketId: "socket_id_string",
  timestamp: 1640995200000,
  nodeId: "node_1"
}
TTL: 3600 seconds (1 hour)
```

## Failure Handling

### Redis Unavailable
- Local Map continues normal operation
- Shadow writes fail silently
- Warning logged to console
- No user-facing errors

### Redis Timeout
- Async operations fail gracefully
- Local Map unaffected
- Metrics track failure count
- No blocking of socket operations

### Network Partition
- Local Map serves all requests
- Redis operations fail
- System remains functional
- Reconnects automatically

## Environment Variables

### Optional Additions to .env.example
```bash
# User Socket Registry (for future multi-node scaling)
NODE_ID=node_1  # Unique identifier for this server instance
REDIS_SOCKET_REGISTRY_TTL=3600  # TTL for socket registry entries in seconds
```

## Testing Strategy

### Unit Testing (Phase 4C)
- Import module safely
- Test local Map operations
- Test Redis shadow writing (mocked)
- Verify no side effects on import
- Confirm userId normalization

### Integration Testing (Future Phases)
- Shadow mode validation
- Redis failure scenarios
- Multi-node consistency checks
- Performance impact assessment

## Migration Path

### Phase 4D: Shadow Write Enable
- Enable shadow mode in development
- Monitor Redis write performance
- Validate diagnostics logging
- No production routing changes

### Phase 4E: Read Fallback Implementation
- Add Redis read fallback logic
- Gradual per-event migration
- Extensive multi-node testing
- Rollback procedures ready

### Phase 4F: Full Multi-Node
- Redis primary, Map backup
- Production deployment validation
- Monitoring and alerting setup

## Safety Locks

### Event Payloads Unchanged
- Socket IDs remain same format
- User ID normalization consistent
- No additional data in events
- Backward compatibility maintained

### Rollback Readiness
- Shadow mode can be disabled instantly
- Redis client can be removed
- Local Map restores full functionality
- No permanent state changes

### Performance Guards
- Redis operations are async/non-blocking
- Local Map operations remain fast
- Memory usage monitored
- Connection pool limits enforced

## Risk Assessment

### Current Phase (4C) - LOW RISK
- Module exists but not used
- No runtime impact
- Easy to remove if needed
- No socket flow changes

### Future Phases - INCREASING RISK
- Shadow writes: MEDIUM (Redis load)
- Read fallback: HIGH (routing logic complexity)
- Multi-node primary: CRITICAL (Redis dependency)

## Next Steps

### Immediate (Phase 4D)
- Design shadow-write enablement
- Define monitoring requirements
- Plan gradual rollout strategy

### Short Term
- Enable shadow mode in staging
- Monitor Redis performance impact
- Validate diagnostics accuracy

### Long Term
- Implement read fallback logic
- Multi-node deployment preparation
- Production scaling validation