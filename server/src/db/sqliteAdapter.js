import { get, run, exec, all, prepare } from '../db/database.js';

let lastInsertRowid = null;

const updateLastInsertRowid = (result) => {
  lastInsertRowid = result?.lastInsertRowid || result?.lastInsertId || null;
  return lastInsertRowid;
};

export const getLastInsertRowid = () => lastInsertRowid;

export const get = (...args) => get(...args);
export const all = (...args) => all(...args);
export const run = (...args) => {
  const result = run(...args);
  return updateLastInsertRowid(result);
};
export const exec = (...args) => exec(...args);
export const prepare = (...args) => prepare(...args);

export const userExists = (userId) => {
  const user = get('SELECT id FROM users WHERE id = ?', userId);
  return !!user;
};

export const getUserById = (userId) => {
  return get('SELECT * FROM users WHERE id = ?', userId);
};

export const getUserByUsername = (username) => {
  return get('SELECT * FROM users WHERE username = ?', username);
};

export const createUser = (username, passwordHash, role = 'user') => {
  const result = run(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    username, passwordHash, role
  );
  return updateLastInsertRowid(result);
};

export const updateUserTokenVersion = (userId) => {
  return run(
    'UPDATE users SET token_version = token_version + 1 WHERE id = ?',
    userId
  );
};

export const createMessage = (senderId, receiverId, content) => {
  const result = run(
    'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
    senderId, receiverId, content
  );
  return updateLastInsertRowid(result);
};

export const getMessagesBetweenUsers = (userId, otherId) => {
  return all(`
    SELECT * FROM messages 
    WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
    AND deleted_at IS NULL
    ORDER BY timestamp ASC
  `, userId, otherId, otherId, userId);
};

export const markMessageAsRead = (messageId, userId) => {
  return run(
    'UPDATE messages SET is_read = 1 WHERE id = ? AND receiver_id = ?',
    messageId, userId
  );
};

export const hideMessage = (messageId, userId) => {
  return run(
    'UPDATE messages SET is_hidden = 1 WHERE id = ? AND (sender_id = ? OR receiver_id = ?)',
    messageId, userId, userId
  );
};

export const deleteMessage = (messageId, userId) => {
  return run(
    'UPDATE messages SET deleted_at = CURRENT_TIMESTAMP, deleted_by = ? WHERE id = ?',
    userId, messageId
  );
};

export const editMessageContent = (messageId, newContent, userId) => {
  const old = get('SELECT content FROM messages WHERE id = ?', messageId);
  if (!old) return null;
  
  run(
    'UPDATE messages SET previous_content = ?, content = ?, edited_at = CURRENT_TIMESTAMP WHERE id = ?',
    old.content, newContent, messageId
  );
  
  run(
    'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
    userId, userId, `Edit: ${messageId}`
  );
  
  return messageId;
};

export const getMessageEdits = (messageId) => {
  return all('SELECT * FROM messages WHERE sender_id = ? AND receiver_id = ? AND previous_content IS NOT NULL ORDER BY timestamp DESC', messageId, messageId);
};

export const searchMessages = (userId, query) => {
  return all(`
    SELECT * FROM messages 
    WHERE (sender_id = ? OR receiver_id = ?) 
    AND content LIKE ? 
    AND deleted_at IS NULL
    ORDER BY timestamp DESC
  `, userId, userId, `%${query}%`);
};

export const getUnreadCount = (userId) => {
  const result = get(
    'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0',
    userId
  );
  return result?.count || 0;
};

export const createBlock = (blockerId, blockedUserId) => {
  const result = run(
    'INSERT OR IGNORE INTO blocked_users (blocker_id, blocked_user_id) VALUES (?, ?)',
    blockerId, blockedUserId
  );
  return updateLastInsertRowid(result);
};

export const removeBlock = (blockerId, blockedUserId) => {
  return run(
    'DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_user_id = ?',
    blockerId, blockedUserId
  );
};

export const isUserBlocked = (blockerId, targetId) => {
  const result = get(
    'SELECT id FROM blocked_users WHERE blocker_id = ? AND blocked_user_id = ?',
    blockerId, targetId
  );
  return !!result;
};

export const getBlockedUsers = (userId) => {
  return all(`
    SELECT u.* FROM users u
    JOIN blocked_users bu ON u.id = bu.blocked_user_id
    WHERE bu.blocker_id = ?
  `, userId);
};

export const createCallHistory = (callerId, receiverId, callType) => {
  const result = run(
    'INSERT INTO call_history (caller_id, receiver_id, call_type, status, started_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
    callerId, receiverId, callType, 'pending'
  );
  return updateLastInsertRowid(result);
};

export const updateCallHistory = (callId, status) => {
  const updates = {
    'answered': 'answered_at = CURRENT_TIMESTAMP',
    'ended': 'ended_at = CURRENT_TIMESTAMP',
    'rejected': 'ended_at = CURRENT_TIMESTAMP',
    'failed': 'ended_at = CURRENT_TIMESTAMP'
  };
  
  if (updates[status]) {
    return run(`UPDATE call_history SET status = ?, ${updates[status]} WHERE id = ?`, status, callId);
  }
  return run('UPDATE call_history SET status = ? WHERE id = ?', status, callId);
};

export const getCallHistory = (userId) => {
  return all(`
    SELECT * FROM call_history 
    WHERE caller_id = ? OR receiver_id = ?
    ORDER BY started_at DESC
    LIMIT 100
  `, userId, userId);
};

export const createReport = (reporterId, messageId, reason) => {
  const result = run(
    'INSERT INTO message_reports (reporter_id, message_id, reason) VALUES (?, ?, ?)',
    reporterId, messageId, reason
  );
  return updateLastInsertRowid(result);
};

export const getReports = () => {
  return all('SELECT * FROM message_reports WHERE status = ? ORDER BY created_at DESC', 'pending');
};

export const resolveReport = (reportId, status) => {
  return run(
    'UPDATE message_reports SET status = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?',
    status, reportId
  );
};

export const createAuditLog = (adminId, action, targetUserId, details) => {
  const result = run(
    'INSERT INTO admin_audit_logs (admin_id, action, target_user_id, details) VALUES (?, ?, ?, ?)',
    adminId, action, targetUserId, details
  );
  return updateLastInsertRowid(result);
};

export const getAuditLogs = (limit = 100) => {
  return all('SELECT * FROM admin_audit_logs ORDER BY timestamp DESC LIMIT ?', limit);
};

export const getMetrics = () => {
  const rows = all('SELECT * FROM metrics');
  const metrics = {};
  rows.forEach(row => {
    metrics[row.key] = row.value;
  });
  return metrics;
};

export const updateMetric = (key, value) => {
  return run(
    'INSERT OR REPLACE INTO metrics (key, value) VALUES (?, ?)',
    key, value
  );
};

export const incrementMetric = (key) => {
  return run(
    'INSERT INTO metrics (key, value) VALUES (?, 1) ON CONFLICT(key) DO UPDATE SET value = value + 1',
    key
  );
};