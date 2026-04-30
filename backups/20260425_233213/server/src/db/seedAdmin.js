import bcrypt from 'bcryptjs';
import { get, run } from '../db/database.js';

export const seedSuperAdmin = async () => {
  const existingSuperAdmin = get("SELECT id, username, role FROM users WHERE role = 'super_admin'");
  
  if (existingSuperAdmin) {
    console.log('[SEED] Super admin already exists:', existingSuperAdmin.username);
    return null;
  }

  const adminUsername = process.env.SUPER_ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!adminPassword) {
    console.warn('[SEED] SUPER_ADMIN_PASSWORD not set in .env - skipping seed');
    return null;
  }

  const hash = await bcrypt.hash(adminPassword, 12);
  const result = run(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    adminUsername,
    hash,
    'super_admin'
  );

  console.log('[SEED] Created super_admin user:', adminUsername);
  return { id: result.lastInsertRowid, username: adminUsername };
};

export const checkSuperAdminExists = () => {
  return get("SELECT id, username FROM users WHERE role = 'super_admin'");
};