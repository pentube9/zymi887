import bcrypt from 'bcryptjs';
import { get, run } from '../db/database.js';
import { config } from '../config/env.js';

export const seedSuperAdmin = async () => {
  const existingSuperAdmin = get("SELECT id, username, role FROM users WHERE role = 'super_admin'");
  
  if (existingSuperAdmin) {
    console.log('[SEED] Super admin already exists:', existingSuperAdmin.username);
    return null;
  }

  const adminUsername = config.superAdminUsername;
  const adminPassword = config.superAdminPassword;

  if (!adminPassword || adminPassword === 'change_this_password') {
    console.warn('[SEED] SUPER_ADMIN_PASSWORD not set or using default - skipping seed. Set a strong password in .env or docker-compose environment');
    console.warn('[SEED] Admin login will fail until SUPER_ADMIN_PASSWORD is configured');
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
  console.log('[SEED] ADMIN CREDENTIALS: username=' + adminUsername + ', password=' + adminPassword.substring(0, 4) + '***');
  return { id: result.lastInsertRowid, username: adminUsername };
};

export const checkSuperAdminExists = () => {
  return get("SELECT id, username FROM users WHERE role = 'super_admin'");
};