import { config, isProduction, isDevelopment } from '../config/env.js';

export const corsOptions = {
  origin: isProduction() ? config.clientOrigin : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

export const socketCorsOptions = {
  origin: isProduction() ? config.clientOrigin : '*',
  methods: ['GET', 'POST'],
  credentials: true
};

export const isOriginAllowed = (origin) => {
  if (isDevelopment()) {
    return true;
  }

  if (!origin) {
    return false;
  }

  const allowedOrigins = config.clientOrigin.split(',').map(o => o.trim());
  return allowedOrigins.includes(origin);
};

export const createCorsMiddleware = () => {
  const { cors } = require('cors');

  if (isProduction()) {
    return cors(corsOptions);
  }

  return cors({
    origin: '*',
    credentials: true
  });
};