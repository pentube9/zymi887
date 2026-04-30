import bcrypt from 'bcryptjs';
import { exec, get, all, run } from './database.js';

const tableExists = (tableName) => {
  const result = get("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", tableName);
  return !!result;
};

const columnExists = (tableName, columnName) => {
  if (!tableExists(tableName)) return false;
  const columns = all(`PRAGMA table_info(${tableName})`);
  return columns.some(col => col.name === columnName);
};

export const runMigrations = () => {
  console.log('[MIGRATION] Starting database migrations...');
  
  if (!tableExists('users')) {
    exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        is_banned INTEGER DEFAULT 0,
        banned_at DATETIME
      )
    `);
    console.log('[MIGRATION] Created users table');
  }
  
  if (!columnExists('users', 'role')) {
    exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
    console.log('[MIGRATION] Added role column to users');
  }
  
  if (!columnExists('users', 'is_banned')) {
    exec("ALTER TABLE users ADD COLUMN is_banned INTEGER DEFAULT 0");
    console.log('[MIGRATION] Added is_banned column to users');
  }
  
   if (!columnExists('users', 'banned_at')) {
     exec("ALTER TABLE users ADD COLUMN banned_at DATETIME");
     console.log('[MIGRATION] Added banned_at column to users');
   }

   if (!columnExists('users', 'avatar')) {
     exec("ALTER TABLE users ADD COLUMN avatar TEXT");
     console.log('[MIGRATION] Added avatar column to users');
   }

   if (!columnExists('users', 'token_version')) {
     exec("ALTER TABLE users ADD COLUMN token_version INTEGER DEFAULT 1");
     console.log('[MIGRATION] Added token_version column to users');
   }

   if (!columnExists('users', 'notification_sound')) {
     exec("ALTER TABLE users ADD COLUMN notification_sound INTEGER DEFAULT 1");
     console.log('[MIGRATION] Added notification_sound column to users');
   }

   if (!columnExists('users', 'call_ringtone')) {
     exec("ALTER TABLE users ADD COLUMN call_ringtone INTEGER DEFAULT 1");
     console.log('[MIGRATION] Added call_ringtone column to users');
   }

   if (!columnExists('users', 'theme')) {
     exec("ALTER TABLE users ADD COLUMN theme TEXT DEFAULT 'dark'");
     console.log('[MIGRATION] Added theme column to users');
   }

   if (!columnExists('users', 'online_visibility')) {
     exec("ALTER TABLE users ADD COLUMN online_visibility INTEGER DEFAULT 1");
     console.log('[MIGRATION] Added online_visibility column to users');
   }

   if (!columnExists('users', 'read_receipt')) {
     exec("ALTER TABLE users ADD COLUMN read_receipt INTEGER DEFAULT 1");
     console.log('[MIGRATION] Added read_receipt column to users');
   }
  
  if (!tableExists('messages')) {
    exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_read INTEGER DEFAULT 0,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
      )
    `);
    console.log('[MIGRATION] Created messages table');
  }
  
   if (!columnExists('messages', 'is_read')) {
     exec("ALTER TABLE messages ADD COLUMN is_read INTEGER DEFAULT 0");
     console.log('[MIGRATION] Added is_read column to messages');
   }

   if (!columnExists('messages', 'is_hidden')) {
     exec("ALTER TABLE messages ADD COLUMN is_hidden INTEGER DEFAULT 0");
     console.log('[MIGRATION] Added is_hidden column to messages');
   }

   if (!columnExists('messages', 'deleted_at')) {
     exec("ALTER TABLE messages ADD COLUMN deleted_at DATETIME");
     console.log('[MIGRATION] Added deleted_at column to messages');
   }

   if (!columnExists('messages', 'deleted_by')) {
     exec("ALTER TABLE messages ADD COLUMN deleted_by INTEGER");
     console.log('[MIGRATION] Added deleted_by column to messages');
   }

   if (!columnExists('messages', 'edited_at')) {
     exec("ALTER TABLE messages ADD COLUMN edited_at DATETIME");
     console.log('[MIGRATION] Added edited_at column to messages');
   }

   if (!columnExists('messages', 'previous_content')) {
     exec("ALTER TABLE messages ADD COLUMN previous_content TEXT");
     console.log('[MIGRATION] Added previous_content column to messages');
   }
  
  if (!tableExists('admin_audit_logs')) {
    exec(`
      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER,
        action TEXT NOT NULL,
        target_user_id INTEGER,
        details TEXT,
        ip_address TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[MIGRATION] Created admin_audit_logs table');
  }
  
  
  console.log('[MIGRATION] Database migrations complete');
};

export const getMigrationStatus = () => {
  const migrations = [];
  
  migrations.push({ name: 'users table', exists: tableExists('users') });
  migrations.push({ name: 'messages table', exists: tableExists('messages') });
  migrations.push({ name: 'admin_audit_logs table', exists: tableExists('admin_audit_logs') });
  migrations.push({ name: 'users.role column', exists: columnExists('users', 'role') });
  migrations.push({ name: 'users.is_banned column', exists: columnExists('users', 'is_banned') });
  migrations.push({ name: 'messages.is_read column', exists: columnExists('messages', 'is_read') });
  
  return migrations;
};