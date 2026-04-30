import jwt from 'jsonwebtoken';
import { get, run } from '../db/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'zymi-secret-key-change-in-production';

export const createToken = (user) => {
  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
      tokenVersion: user.token_version || 1
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  return token;
};

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
};

export const getTokenVersion = (userId) => {
  const user = get('SELECT token_version FROM users WHERE id = ?', userId);
  return user?.token_version || 1;
};

export const incrementTokenVersion = (userId) => {
  run('UPDATE users SET token_version = token_version + 1 WHERE id = ?', userId);
  const newVersion = getTokenVersion(userId);
  return newVersion;
};

export const isTokenValid = (userId, tokenVersion) => {
  const currentVersion = getTokenVersion(userId);
  return currentVersion === tokenVersion;
};
