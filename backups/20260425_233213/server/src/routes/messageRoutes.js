import { get, all, run } from '../db/database.js';
import { getApp } from '../../index.js';
import { SOCKET_EVENTS } from '../../../shared/socketEvents.js';

export const getUsers = (req, res) => {
  const users = all('SELECT id, username FROM users WHERE is_banned = 0');
  res.json(users);
};

export const getMessages = (req, res) => {
  const userId = req.user.id;
  const { otherId } = req.params;

  const messages = all(`
    SELECT * FROM messages
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY timestamp ASC
  `, userId, otherId, otherId, userId);

  res.json(messages);
};

export const searchMessages = (req, res) => {
  const userId = req.user.id;
  const { q } = req.query;

  if (!q) return res.json([]);

  const messages = all(`
    SELECT * FROM messages
    WHERE (sender_id = ? OR receiver_id = ?) AND content LIKE ?
    ORDER BY timestamp DESC
    LIMIT 50
  `, userId, userId, `%${q}%`);

  res.json(messages);
};

export const getUnread = (req, res) => {
  const userId = req.user.id;

  const unread = all(`
    SELECT sender_id, COUNT(*) as unread_count
    FROM messages
    WHERE receiver_id = ? AND is_read = 0
    GROUP BY sender_id
  `, userId);

  res.json(unread);
};

export const markAsRead = (req, res) => {
  const userId = req.user.id;
  const { senderId } = req.body;

  if (!senderId) {
    return res.status(400).json({ error: 'senderId required' });
  }

  run('UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ?', userId, senderId);

  // Emit read receipt if enabled for the receiver
  if (req.user.settings?.readReceipt !== false) {
    const app = getApp();
    const io = app.get('io');
    if (io) {
      io.to(senderId).emit(SOCKET_EVENTS.MESSAGE_SEEN, {
        by: userId,
        timestamp: new Date().toISOString()
      });
    }
  }

  res.json({ success: true });
};

export const getReadStatus = (req, res) => {
  const userId = req.user.id;
  const { messageIds } = req.query;

  if (!messageIds) {
    return res.json({});
  }

  const ids = messageIds.split(',').map(Number);
  const placeholders = ids.map(() => '?').join(',');
  const readMessages = all(`
    SELECT id FROM messages
    WHERE id IN (${placeholders}) AND is_read = 1 AND receiver_id = ?
  `, ...ids, userId);

  const readIds = readMessages.map(m => m.id);
  res.json({ read: readIds });
};