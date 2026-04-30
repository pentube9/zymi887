import dotenv from 'dotenv';

dotenv.config();

const requiredInProduction = (key) => {
  if (process.env.NODE_ENV === 'production' && !process.env[key]) {
    throw new Error(`${key} is required in production`);
  }
};

if (process.env.NODE_ENV === 'production') {
  requiredInProduction('JWT_SECRET');
  requiredInProduction('CLIENT_ORIGIN');

  // JWT_SECRET hardening
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
  if (jwtSecret === 'dev_secret_change_in_production') {
    throw new Error('JWT_SECRET cannot use default development value in production');
  }

  // CLIENT_ORIGIN hardening
  const clientOrigin = process.env.CLIENT_ORIGIN;
  if (clientOrigin && clientOrigin.includes('localhost')) {
    console.warn('[WARNING] CLIENT_ORIGIN contains localhost in production. This may cause CORS issues.');
  }

  // PORT validation
  const port = parseInt(process.env.PORT);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid number between 1-65535');
  }
}

export const config = {
  port: parseInt(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5175',
  dbName: process.env.DB_NAME || 'ovyo.db',
  superAdminUsername: process.env.SUPER_ADMIN_USERNAME || 'admin',
  superAdminPassword: process.env.SUPER_ADMIN_PASSWORD || 'change_this_password'
};

export const isProduction = () => config.nodeEnv === 'production';
export const isDevelopment = () => config.nodeEnv === 'development';
export const isTest = () => config.nodeEnv === 'test';

export const requireAuth = (key) => {
  if (!config[key]) {
    throw new Error(`${key} environment variable is required`);
  }
};