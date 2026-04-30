# Real-Time Scaling Limitations - Phase 4A

## Current Architecture Status

### userSockets Map Behavior
- **Location**: In-memory Map in server/index.js (line 181)
- **Purpose**: Maps userId → socket.id for real-time message/call routing
- **Set**: chatSocket.js on JOIN event (userSockets.set(userId, socket.id))
- **Get**: Multiple locations for direct user-to-user routing:
  - private-message events
  - call-user, make-answer, ice-candidate events
  - Admin notifications (ban/unban)
  - Profile updates (password change)
- **Delete**: chatSocket.js on disconnect (userSockets.delete(socket.userId))
- **ID Type**: Numeric userId from database

### Single-Node Safe Status
✅ **Safe Operations**:
- Messages between users on same server
- Call signaling (offer/answer) on same server
- ICE candidate exchange on same server
- Online/offline presence on same server
- Admin notifications on same server

## Multi-Node Risks

### Message Delivery Risk - CRITICAL
**Impact**: Messages fail when sender/receiver on different nodes
**Affected Events**: private-message, new-message, receive_message
**Current Behavior**: Map.get() returns undefined, message lost
**User Experience**: Messages don't arrive, no error shown

### Call Signaling Risk - CRITICAL
**Impact**: Calls cannot start when participants on different nodes
**Affected Events**: call-user, incoming-call, make-answer, call-answer
**Current Behavior**: call-user event finds no socketId, call fails silently
**User Experience**: Call button appears to work but nothing happens

### ICE Candidate Routing Risk - CRITICAL
**Impact**: WebRTC connections fail even if call signaling works
**Affected Events**: ice-candidate
**Current Behavior**: Candidates sent to wrong/invalid socketId
**User Experience**: Call connects but no audio/video stream

### Online/Offline Presence Risk - HIGH
**Impact**: Presence status inconsistent across nodes
**Affected Events**: user-online, user-offline
**Current Behavior**: User appears offline on nodes they aren't connected to
**User Experience**: Confusing presence indicators

### Disconnect Cleanup Risk - MEDIUM
**Impact**: Socket cleanup only happens on originating node
**Current Behavior**: Memory leaks possible in multi-node setup
**User Experience**: No immediate user impact, but server performance degradation

## Redis Adapter vs UserSockets Registry Difference

### Socket.io Redis Adapter (Currently Configured)
- **Purpose**: Broadcasts events between multiple Socket.io servers
- **Scope**: Event broadcasting only (messages, presence, etc.)
- **Limitation**: Does NOT handle user-to-socket routing
- **Status**: Installed, configured, but REDIS_URL empty (single-instance mode)

### UserSockets Registry (Required for Scaling)
- **Purpose**: Distributed Map of userId → socketId across nodes
- **Scope**: Direct user routing for messages, calls, ICE candidates
- **Implementation**: Redis-backed registry with local caching
- **Status**: Not implemented, required for true multi-node scaling

## Recommended Future Migration

### Phase 4B: Helper Module Proposal (Not Wired)
- Create server/src/socket/userSocketRegistry.js
- Redis/Local fallback architecture
- No production deployment

### Phase 4C: Shadow-Write Redis Registry
- Registry writes to both Map and Redis
- Reads from Map only (primary)
- Fallback validation mode

### Phase 4D: Redis Read Fallback
- Primary: Map, Secondary: Redis
- Gradual migration per event type
- Extensive multi-node testing

### Phase 4E: Multi-Node Validation
- Redis primary, Map backup
- Full production testing
- Rollback procedures ready

## Rollback Strategy
1. **Immediate**: Remove REDIS_URL, return to single-instance mode
2. **Short-term**: Disable Redis writes, keep Map primary
3. **Long-term**: Revert to pre-Phase 4C code if issues persist

## Strict No-Touch Event List
These socket events MUST remain unchanged:
- join
- private-message
- call-user
- incoming-call
- make-answer
- call-answer
- ice-candidate
- end-call
- call-ended
- user-online
- user-offline
- banned

## Current Mitigation
- **Production Deployment**: Single-node only
- **Scaling Warning**: Added to Project Brain risk board
- **Documentation**: This limitation clearly documented
- **Future Planning**: Phased migration path defined

## Testing Recommendations
- Test message delivery in single-node setup
- Test call functionality in single-node setup
- Monitor socket connection counts
- Validate admin notification delivery
- Check presence status accuracy

## Next Steps
Await approval for Phase 4B: Redis userSocketRegistry helper module design (no implementation).