import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const dbPath = path.join(__dirname, 'server', 'src', 'zymi.db');
const db = new Database(dbPath);

const username = process.env.SUPER_ADMIN_USERNAME || 'admin';
const password = process.env.SUPER_ADMIN_PASSWORD || 'admin123';

console.log('Checking for super_admin:', username);

const user = db.prepare('SELECT id, username, role, password FROM users WHERE username = ?').get(username);

if (user) {
  console.log('User found:', user.username, 'Role:', user.role);
  const hash = bcrypt.hashSync(password, 12);
  db.prepare('UPDATE users SET password = ?, role = ? WHERE id = ?').run(hash, 'super_admin', user.id);
  console.log('Password and role updated for:', username);
} else {
  console.log('User not found. Creating new super_admin:', username);
  const hash = bcrypt.hashSync(password, 12);
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(username, hash, 'super_admin');
  console.log('Super admin created.');
}

const allAdmins = db.prepare('SELECT id, username, role FROM users WHERE role IN ("admin", "super_admin")').all();
console.log('Current Admins:', JSON.stringify(allAdmins, null, 2));

db.close();
