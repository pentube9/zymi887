import Database from 'better-sqlite3';
import { query, getPostgresPool, initPostgres, closePostgres, testConnection } from '../db/postgres.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQLITE_DB_PATH = path.join(__dirname, '..', 'ovyo.db');

async function migrateUsers(sqliteDb) {
  console.log('[MIGRATION] Migrating users...');
  const users = sqliteDb.prepare('SELECT * FROM users').all();
  
  for (const user of users) {
    await query(
      `INSERT INTO users (id, username, password, email, name, avatar, role, is_banned, banned_at, token_version, notification_sound, call_ringtone, theme, online_visibility, read_receipt, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, password = EXCLUDED.password`,
      [
        user.id,
        user.username,
        user.password,
        user.email || null,
        user.name || null,
        user.avatar || null,
        user.role || 'user',
        user.is_banned ? true : false,
        user.banned_at || null,
        user.token_version || 1,
        user.notification_sound ? true : false,
        user.call_ringtone ? true : false,
        user.theme || 'dark',
        user.online_visibility !== false ? true : false,
        user.read_receipt !== false ? true : false,
        user.created_at || new Date().toISOString(),
        user.updated_at || new Date().toISOString()
      ]
    );
  }
  console.log(`[MIGRATION] Migrated ${users.length} users`);
  return users.length;
}

async function migrateMessages(sqliteDb) {
  console.log('[MIGRATION] Migrating messages...');
  const messages = sqliteDb.prepare('SELECT * FROM messages').all();
  
  for (const msg of messages) {
    await query(
      `INSERT INTO messages (id, sender_id, receiver_id, content, is_read, is_hidden, deleted_at, deleted_by, edited_at, previous_content, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content`,
      [
        msg.id,
        msg.sender_id,
        msg.receiver_id,
        msg.content,
        msg.is_read ? true : false,
        msg.is_hidden ? true : false,
        msg.deleted_at || null,
        msg.deleted_by || null,
        msg.edited_at || null,
        msg.previous_content || null,
        msg.timestamp || msg.created_at || new Date().toISOString(),
        msg.updated_at || new Date().toISOString()
      ]
    );
  }
  console.log(`[MIGRATION] Migrated ${messages.length} messages`);
  return messages.length;
}

async function migrateBlockedUsers(sqliteDb) {
  console.log('[MIGRATION] Migrating blocked users...');
  const blocked = sqliteDb.prepare('SELECT * FROM blocked_users').all();
  
  for (const block of blocked) {
    await query(
      `INSERT INTO blocked_users (blocker_id, blocked_user_id, created_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (blocker_id, blocked_user_id) DO NOTHING`,
      [block.blocker_id, block.blocked_user_id, block.created_at || new Date().toISOString()]
    );
  }
  console.log(`[MIGRATION] Migrated ${blocked.length} blocked user records`);
  return blocked.length;
}

async function migrateMessageReports(sqliteDb) {
  console.log('[MIGRATION] Migrating message reports...');
  const reports = sqliteDb.prepare('SELECT * FROM message_reports').all();
  
  for (const report of reports) {
    await query(
      `INSERT INTO message_reports (id, reporter_id, message_id, reason, status, resolved_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status`,
      [
        report.id,
        report.reporter_id,
        report.message_id,
        report.reason,
        report.status || 'pending',
        report.resolved_at || null,
        report.created_at || new Date().toISOString()
      ]
    );
  }
  console.log(`[MIGRATION] Migrated ${reports.length} reports`);
  return reports.length;
}

async function migrateCallHistory(sqliteDb) {
  console.log('[MIGRATION] Migrating call history...');
  const calls = sqliteDb.prepare('SELECT * FROM call_history').all();
  
  for (const call of calls) {
    await query(
      `INSERT INTO call_history (id, caller_id, receiver_id, call_type, status, started_at, answered_at, ended_at, duration_seconds)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status`,
      [
        call.id,
        call.caller_id,
        call.receiver_id,
        call.call_type || 'audio',
        call.status || 'pending',
        call.started_at || new Date().toISOString(),
        call.answered_at || null,
        call.ended_at || null,
        call.duration_seconds || 0
      ]
    );
  }
  console.log(`[MIGRATION] Migrated ${calls.length} call history records`);
  return calls.length;
}

async function migrateAdminAuditLogs(sqliteDb) {
  console.log('[MIGRATION] Migrating admin audit logs...');
  const logs = sqliteDb.prepare('SELECT * FROM admin_audit_logs').all();
  
  for (const log of logs) {
    await query(
      `INSERT INTO admin_audit_logs (id, admin_id, action, target_user_id, details, ip_address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET action = EXCLUDED.action`,
      [
        log.id,
        log.admin_id,
        log.action,
        log.target_user_id,
        log.details,
        log.ip_address,
        log.timestamp || log.created_at || new Date().toISOString()
      ]
    );
  }
  console.log(`[MIGRATION] Migrated ${logs.length} audit logs`);
  return logs.length;
}

async function migrateMetrics(sqliteDb) {
  console.log('[MIGRATION] Migrating metrics...');
  const metrics = sqliteDb.prepare('SELECT * FROM metrics').all();
  
  for (const metric of metrics) {
    await query(
      `INSERT INTO metrics (key, value, updated_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [metric.key, metric.value, metric.updated_at || new Date().toISOString()]
    );
  }
  console.log(`[MIGRATION] Migrated ${metrics.length} metrics`);
  return metrics.length;
}

async function verifyCounts(sqliteDb, postgresPool) {
  console.log('\n[MIGRATION] Verifying row counts...\n');
  
  const tables = ['users', 'messages', 'blocked_users', 'message_reports', 'call_history', 'admin_audit_logs', 'metrics'];
  const results = [];
  
  for (const table of tables) {
    try {
      const sqliteCount = sqliteDb.prepare(`SELECT COUNT(*) as count FROM ${table}`).get().count;
      const pgResult = await postgresPool.query(`SELECT COUNT(*) as count FROM ${table}`);
      const pgCount = parseInt(pgResult.rows[0]?.count || 0);
      
      results.push({
        table,
        sqlite: sqliteCount,
        postgres: pgCount,
        match: sqliteCount === pgCount
      });
      
      console.log(`  ${table}: SQLite=${sqliteCount}, PostgreSQL=${pgCount} ${sqliteCount === pgCount ? '✓' : '⚠ MISMATCH'}`);
    } catch (err) {
      console.log(`  ${table}: Error - ${err.message}`);
    }
  }
  
  return results;
}

async function runMigration() {
  console.log('='.repeat(60));
  console.log('SQLite to PostgreSQL Migration');
  console.log('='.repeat(60));
  console.log('');
  
  if (!fs.existsSync(SQLITE_DB_PATH)) {
    console.error(`[ERROR] SQLite database not found at: ${SQLITE_DB_PATH}`);
    process.exit(1);
  }
  
  console.log(`[INFO] Reading from SQLite: ${SQLITE_DB_PATH}`);
  
  const sqliteDb = new Database(SQLITE_DB_PATH);
  sqliteDb.pragma('journal_mode = WAL');
  
  try {
    await initPostgres();
    
    const testResult = await testConnection();
    if (!testResult.connected) {
      throw new Error(`PostgreSQL not available: ${testResult.error}`);
    }
    
    console.log('[INFO] PostgreSQL connected successfully');
    
    const usersCount = await migrateUsers(sqliteDb);
    const messagesCount = await migrateMessages(sqliteDb);
    const blockedCount = await migrateBlockedUsers(sqliteDb);
    const reportsCount = await migrateMessageReports(sqliteDb);
    const callsCount = await migrateCallHistory(sqliteDb);
    const auditCount = await migrateAdminAuditLogs(sqliteDb);
    const metricsCount = await migrateMetrics(sqliteDb);
    
    console.log('\n' + '='.repeat(60));
    console.log('Migration Summary');
    console.log('='.repeat(60));
    console.log(`  Users:             ${usersCount}`);
    console.log(`  Messages:         ${messagesCount}`);
    console.log(`  Blocked Users:    ${blockedCount}`);
    console.log(`  Reports:         ${reportsCount}`);
    console.log(`  Call History:     ${callsCount}`);
    console.log(`  Audit Logs:       ${auditCount}`);
    console.log(`  Metrics:          ${metricsCount}`);
    console.log('='.repeat(60));
    
    await verifyCounts(sqliteDb, getPostgresPool());
    
    console.log('\n[MIGRATION] Complete! Do NOT delete your SQLite database until verified.');
    
  } catch (error) {
    console.error('[ERROR] Migration failed:', error.message);
    process.exit(1);
  } finally {
    sqliteDb.close();
    await closePostgres();
  }
}

runMigration().catch(console.error);