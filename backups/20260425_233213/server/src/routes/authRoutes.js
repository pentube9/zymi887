import bcrypt from 'bcryptjs';
import { get, run } from '../db/database.js';
import { createToken } from '../services/sessionService.js';

export const register = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const hash = bcrypt.hashSync(password, 12);
    const result = run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', username, hash, 'user');
    const user = get('SELECT id, username, role, token_version FROM users WHERE id = ?', result.lastInsertRowid);
    const token = createToken(user);
    res.json({ id: user.id, username: user.username, role: user.role, token });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
};

export const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = get('SELECT * FROM users WHERE username = ?', username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (user.is_banned) {
    return res.status(403).json({ error: 'Account suspended' });
  }

  const token = createToken(user);
  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    token
  });
};

export const adminLogin = (req, res) => {
  const { username, password } = req.body;
  console.log('[AUTH] Admin login attempt:', username);

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const admin = get('SELECT * FROM users WHERE username = ? AND role IN (?, ?)', username, 'admin', 'super_admin');

  if (!admin) {
    console.log('[AUTH] Admin user not found:', username);
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  if (!bcrypt.compareSync(password, admin.password)) {
    console.log('[AUTH] Invalid password for admin:', username);
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  const token = createToken(admin);
  res.json({
    token,
    admin: { id: admin.id, username: admin.username, role: admin.role }
  });
};