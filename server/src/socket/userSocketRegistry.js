// User Socket Registry - Redis/Local Hybrid
// Phase 4C: Helper Module Only - Not Wired to Runtime
// Provides distributed userId → socketId mapping for multi-node scaling

class UserSocketRegistry {
  constructor(redisClient = null) {
    this.localMap = new Map(); // Primary: userId → socketId
    this.redisClient = redisClient; // Optional: for multi-node
    this.shadowMode = false; // Write to Redis but read from local only
    this.healthMetrics = {
      localOperations: 0,
      redisOperations: 0,
      redisFailures: 0,
      staleSocketIds: 0
    };
  }

  // Core API - Local Map Primary
  setUserSocket(userId, socketId) {
    // Normalize userId to string for consistency
    const normalizedUserId = String(userId);

    // Update local Map (always primary)
    this.localMap.set(normalizedUserId, socketId);
    this.healthMetrics.localOperations++;

    // Shadow write to Redis if enabled
    if (this.shadowMode && this.redisClient) {
      this._shadowWriteToRedis(normalizedUserId, socketId);
    }

    return true;
  }

  getUserSocket(userId) {
    const normalizedUserId = String(userId);

    // Always read from local Map (primary)
    const socketId = this.localMap.get(normalizedUserId);
    this.healthMetrics.localOperations++;

    // In shadow mode, optionally compare with Redis for diagnostics
    if (this.shadowMode && this.redisClient) {
      this._compareWithRedis(normalizedUserId, socketId);
    }

    return socketId;
  }

  deleteUserSocket(userId) {
    const normalizedUserId = String(userId);

    // Delete from local Map
    const deleted = this.localMap.delete(normalizedUserId);
    this.healthMetrics.localOperations++;

    // Shadow delete from Redis
    if (this.shadowMode && this.redisClient) {
      this._shadowDeleteFromRedis(normalizedUserId);
    }

    return deleted;
  }

  hasUserSocket(userId) {
    const normalizedUserId = String(userId);
    this.healthMetrics.localOperations++;
    return this.localMap.has(normalizedUserId);
  }

  getRegistryHealth() {
    return {
      localMapSize: this.localMap.size,
      shadowMode: this.shadowMode,
      redisAvailable: !!this.redisClient,
      metrics: { ...this.healthMetrics },
      timestamp: Date.now()
    };
  }

  // Shadow Mode Controls
  enableShadowMode() {
    if (!this.redisClient) {
      console.warn('[UserSocketRegistry] Cannot enable shadow mode: Redis not available');
      return false;
    }
    this.shadowMode = true;
    console.log('[UserSocketRegistry] Shadow mode enabled');
    return true;
  }

  disableShadowMode() {
    this.shadowMode = false;
    console.log('[UserSocketRegistry] Shadow mode disabled');
    return true;
  }

  // Private Methods - Redis Operations (Shadow Mode Only)
  async _shadowWriteToRedis(userId, socketId) {
    try {
      const key = `user_socket:${userId}`;
      const value = JSON.stringify({
        socketId,
        timestamp: Date.now(),
        nodeId: process.env.NODE_ID || 'unknown'
      });

      await this.redisClient.setex(key, 3600, value); // 1 hour TTL
      this.healthMetrics.redisOperations++;
    } catch (error) {
      console.error('[UserSocketRegistry] Redis shadow write failed:', error.message);
      this.healthMetrics.redisFailures++;
    }
  }

  async _shadowDeleteFromRedis(userId) {
    try {
      const key = `user_socket:${userId}`;
      await this.redisClient.del(key);
      this.healthMetrics.redisOperations++;
    } catch (error) {
      console.error('[UserSocketRegistry] Redis shadow delete failed:', error.message);
      this.healthMetrics.redisFailures++;
    }
  }

  async _compareWithRedis(userId, localSocketId) {
    // Diagnostics only - compare local vs Redis for monitoring
    try {
      const key = `user_socket:${userId}`;
      const redisData = await this.redisClient.get(key);

      if (redisData) {
        const parsed = JSON.parse(redisData);
        if (parsed.socketId !== localSocketId) {
          console.warn(`[UserSocketRegistry] Socket ID mismatch for user ${userId}: local=${localSocketId}, redis=${parsed.socketId}`);
        }
      } else {
        console.warn(`[UserSocketRegistry] User ${userId} not found in Redis but exists locally`);
      }
    } catch (error) {
      // Redis comparison failures are non-critical
      this.healthMetrics.redisFailures++;
    }
  }

  // Cleanup for stale entries
  cleanupStaleSockets() {
    // Implementation for removing disconnected sockets
    // Called periodically or on Redis key expiration
  }
}

// Export singleton instance
let registryInstance = null;

export function getUserSocketRegistry() {
  if (!registryInstance) {
    // Redis client would be passed from server initialization
    registryInstance = new UserSocketRegistry(null); // Redis client placeholder
  }
  return registryInstance;
}

export { UserSocketRegistry };