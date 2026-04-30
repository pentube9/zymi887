import { run, all } from '../db/database.js';

export const logAudit = (adminId, action, targetUserId, details, ipAddress = null) => {
  try {
    const stmt = run(
      'INSERT INTO admin_audit_logs (admin_id, action, target_user_id, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      adminId, action, targetUserId, details, ipAddress
    );
    return stmt;
  } catch (err) {
    console.error('[AUDIT LOG ERROR]', err.message);
    return null;
  }
};

export const getAuditLogs = (limit = 50, offset = 0) => {
  return all(
    `SELECT l.*, u.username as admin_username 
     FROM admin_audit_logs l 
     LEFT JOIN users u ON l.admin_id = u.id 
     ORDER BY l.timestamp DESC 
     LIMIT ? OFFSET ?`,
    limit, offset
  );
};

export const getAuditLogsByAction = (action, limit = 50) => {
  return all(
    `SELECT l.*, u.username as admin_username 
     FROM admin_audit_logs l 
     LEFT JOIN users u ON l.admin_id = u.id 
     WHERE l.action = ?
     ORDER BY l.timestamp DESC 
     LIMIT ?`,
    action, limit
  );
};

export const getAuditLogsByUser = (userId, limit = 50) => {
  return all(
    `SELECT l.*, u.username as admin_username 
     FROM admin_audit_logs l 
     LEFT JOIN users u ON l.admin_id = u.id 
     WHERE l.target_user_id = ?
     ORDER BY l.timestamp DESC 
     LIMIT ?`,
    userId, limit
  );
};

export const getAuditLogsByAdmin = (adminId, limit = 50) => {
  return all(
    `SELECT l.*, u.username as admin_username 
     FROM admin_audit_logs l 
     LEFT JOIN users ux ON l.admin_id = ux.id 
     WHERE l.admin_id = ?
     ORDER BY l.timestamp DESC 
     LIMIT ?`,
    adminId, limit
  );
};

export const getAuditStats = () => {
  const total = all('SELECT COUNT(*) as count FROM admin_audit_logs')[0];
  const byAction = all(`
    SELECT action, COUNT(*) as count 
    FROM admin_audit_logs 
    GROUP BY action 
    ORDER BY count DESC
  `);
  const recent = getAuditLogs(10);
  
  return { total: total.count, byAction, recent };
};