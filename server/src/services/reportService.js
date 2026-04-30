import { exec, get, all, run } from '../db/database.js';

const tableExists = (tableName) => {
  const result = get("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", tableName);
  return !!result;
};

export const createReportsTable = () => {
  if (!tableExists('message_reports')) {
    exec(`
      CREATE TABLE IF NOT EXISTS message_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id INTEGER NOT NULL,
        reporter_id INTEGER NOT NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        admin_id INTEGER,
        admin_action TEXT,
        action_details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME,
        FOREIGN KEY (message_id) REFERENCES messages(id),
        FOREIGN KEY (reporter_id) REFERENCES users(id),
        FOREIGN KEY (admin_id) REFERENCES users(id)
      )
    `);
    console.log('[MIGRATION] Created message_reports table');
  }
};

export const createReport = (messageId, reporterId, reason) => {
  const existing = get(
    'SELECT id FROM message_reports WHERE message_id = ? AND reporter_id = ?',
    messageId,
    reporterId
  );
  if (existing) {
    return { success: false, error: 'Already reported' };
  }
  
  try {
    const result = run(
      'INSERT INTO message_reports (message_id, reporter_id, reason) VALUES (?, ?, ?)',
      messageId,
      reporterId,
      reason
    );
    return { success: true, id: result.lastInsertRowid };
  } catch (err) {
    return { success: false, error: 'Failed to report' };
  }
};

export const getReports = (status = 'pending') => {
  return all(`
    SELECT 
      r.id,
      r.message_id,
      r.reporter_id,
      r.reason,
      r.status,
      r.created_at,
      m.content,
      m.sender_id,
      u.username as reporter_username,
      s.username as sender_username
    FROM message_reports r
    JOIN messages m ON r.message_id = m.id
    JOIN users u ON r.reporter_id = u.id
    JOIN users s ON m.sender_id = s.id
    WHERE r.status = ?
    ORDER BY r.created_at DESC
  `, status);
};

export const resolveReport = (reportId, adminId, action, extraData = {}) => {
  const allowedActions = ['dismissed', 'reviewed', 'hide_message', 'warn_user', 'ban_user'];
  if (!allowedActions.includes(action)) {
    throw new Error('Invalid action');
  }

  const details = JSON.stringify(extraData || {});

  run(
    `UPDATE message_reports
     SET status = 'resolved', admin_id = ?, admin_action = ?, action_details = ?, resolved_at = ?
     WHERE id = ?`,
    adminId,
    action,
    details,
    new Date().toISOString(),
    reportId
  );

  // Perform side effects based on action
  if (action === 'hide_message' && extraData.messageId) {
    // Soft hide message (do not delete, but mark as hidden by admin)
    run('UPDATE messages SET is_hidden = 1 WHERE id = ?', extraData.messageId);
  }

  if (action === 'ban_user' && extraData.userId) {
    run('UPDATE users SET is_banned = 1, banned_at = ? WHERE id = ?', new Date().toISOString(), extraData.userId);
  }

  return true;
};