import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env from the server root (one level up from this script)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dbPath = path.join(__dirname, '..', 'src', 'zymi.db');
const db = new Database(dbPath);

const username = process.env.SUPER_ADMIN_USERNAME || 'admin';
const password = process.env.SUPER_ADMIN_PASSWORD || 'admin123';

console.log('[RESET] Using database:', dbPath);
console.log('[RESET] Target credentials: username=' + username + ', password=' + password);

const user = db.prepare('SELECT id, username, role FROM users WHERE username = ?').get(username);

if (user) {
  console.log('[RESET] User found:', user.username, 'Role:', user.role);
  const hash = bcrypt.hashSync(password, 12);
  db.prepare('UPDATE users SET password = ?, role = ? WHERE id = ?').run(hash, 'super_admin', user.id);
  console.log('[RESET] Password and role forced to super_admin for:', username);
} else {
  console.log('[RESET] User not found. Creating new super_admin:', username);
  const hash = bcrypt.hashSync(password, 12);
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(username, hash, 'super_admin');
  console.log('[RESET] Super admin created successfully.');
}

const allAdmins = db.prepare("SELECT id, username, role FROM users WHERE role IN ('admin', 'super_admin')").all();
console.log('[RESET] All current admins:', JSON.stringify(allAdmins, null, 2));

db.close();
console.log('[RESET] Database connection closed.');
