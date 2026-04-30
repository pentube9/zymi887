import pg from 'pg';
import { config, isProduction } from '../config/env.js';

const { Pool } = pg;

let pool = null;

export const initPostgres = () => {
  if (!config.databaseUrl) {
    if (isProduction()) {
      throw new Error('DATABASE_URL is required in production');
    }
    console.warn('[POSTGRES] DATABASE_URL not set, PostgreSQL not available');
    return null;
  }

  pool = new Pool({
    connectionString: config.databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('error', (err) => {
    console.error('[POSTGRES] Unexpected error on idle client', err);
  });

  console.log('[POSTGRES] Connection pool initialized');
  return pool;
};

export const getPostgresPool = () => {
  if (!pool) {
    throw new Error('PostgreSQL pool not initialized. Call initPostgres() first.');
  }
  return pool;
};

export const isPostgresReady = () => pool !== null;

export const query = async (text, params) => {
  if (!pool) {
    throw new Error('PostgreSQL not initialized');
  }
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('[POSTGRES] Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
  return res;
};

export const getClient = async () => {
  if (!pool) {
    throw new Error('PostgreSQL not initialized');
  }
  return pool.connect();
};

export const closePostgres = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('[POSTGRES] Connection pool closed');
  }
};

export const testConnection = async () => {
  if (!pool) {
    return { connected: false, error: 'Pool not initialized' };
  }
  try {
    const result = await pool.query('SELECT 1 as test');
    return { connected: true, latency: result.duration || 0 };
  } catch (err) {
    return { connected: false, error: err.message };
  }
};