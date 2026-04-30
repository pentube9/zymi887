import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { config, isProduction } from '../config/env.js';

let redisClient = null;
let redisAdapter = null;
let isRedisConnected = false;

export const initRedis = async (io) => {
  if (!config.redisUrl) {
    console.log('[REDIS] REDIS_URL not set, running without Redis adapter');
    return { adapter: null, client: null, connected: false };
  }

  try {
    const [pubClient, subClient] = [
      createClient({ url: config.redisUrl, socket: { reconnectStrategy: (retries) => retries > 10 ? new Error('Max retries') : Math.min(retries * 100, 1000) } }),
      createClient({ url: config.redisUrl, socket: { reconnectStrategy: (retries) => retries > 10 ? new Error('Max retries') : Math.min(retries * 100, 1000) } })
    ];

    pubClient.on('error', (err) => {
      if (err.message !== 'Connection refused' && err.message !== 'Redis is connecting') {
        console.error('[REDIS] Publisher error:', err.message);
      }
      isRedisConnected = false;
    });

    subClient.on('error', (err) => {
      if (err.message !== 'Connection refused' && err.message !== 'Redis is connecting') {
        console.error('[REDIS] Subscriber error:', err.message);
      }
      isRedisConnected = false;
    });

    await Promise.all([pubClient.connect(), subClient.connect()]);
    
    redisClient = pubClient;
    isRedisConnected = true;

    const adapter = createAdapter(pubClient, subClient);
    redisAdapter = adapter;

    console.log('[REDIS] Connected successfully - pub/sub clients established');
    console.log('[REDIS] Socket.io Redis adapter attached');

    return { adapter, client: pubClient, connected: true };
  } catch (err) {
    console.error('[REDIS] Failed to initialize:', err.message);
    
    if (isProduction()) {
      console.warn('[REDIS] Production mode - continuing without Redis (single-instance)');
    } else {
      console.warn('[REDIS] Dev mode - continuing without Redis');
    }
    
    return { adapter: null, client: null, connected: false };
  }
};

export const getRedisClient = () => redisClient;
export const getRedisAdapter = () => redisAdapter;
export const isRedisActive = () => isRedisConnected;

export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    isRedisConnected = false;
    console.log('[REDIS] Connection closed');
  }
};

export const testRedis = async () => {
  if (!redisClient) {
    return { connected: false, error: 'Redis not initialized' };
  }
  try {
    await redisClient.ping();
    return { connected: true };
  } catch (err) {
    return { connected: false, error: err.message };
  }
};