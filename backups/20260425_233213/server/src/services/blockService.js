import { exec, get, all, run } from '../db/database.js';

const tableExists = (tableName) => {
  const result = get("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", tableName);
  return !!result;
};

export const createBlockTable = () => {
  if (!tableExists('blocked_users')) {
    exec(`
      CREATE TABLE IF NOT EXISTS blocked_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        blocker_id INTEGER NOT NULL,
        blocked_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blocker_id, blocked_id)
      )
    `);
    console.log('[MIGRATION] Created blocked_users table');
  }
};

export const checkBlocked = (blockerId, blockedId) => {
  const result = get(
    'SELECT id FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?',
    blockerId,
    blockedId
  );
  return !!result;
};

export const blockUser = (blockerId, blockedId) => {
  try {
    run(
      'INSERT OR IGNORE INTO blocked_users (blocker_id, blocked_id) VALUES (?, ?)',
      blockerId,
      blockedId
    );
    return true;
  } catch (err) {
    return false;
  }
};

export const unblockUser = (blockerId, blockedId) => {
  run(
    'DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?',
    blockerId,
    blockedId
  );
  return true;
};

export const getBlockedUsers = (userId) => {
  return all(`
    SELECT u.id, u.username, b.created_at as blocked_at
    FROM blocked_users b
    JOIN users u ON b.blocked_id = u.id
    WHERE b.blocker_id = ?
    ORDER BY b.created_at DESC
  `, userId);
};