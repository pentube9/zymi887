import { get, run, all } from '../db/database.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { logAudit } from '../services/auditService.js';
import { getApp } from '../../index.js';
import { SOCKET_EVENTS } from '../../../shared/socketEvents.js';

export const editMessage = (req, res) => {
  const userId = req.user.id;
  const { messageId, content } = req.body;

  if (!messageId || !content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Message ID and content required' });
  }

  const message = get('SELECT * FROM messages WHERE id = ?', messageId);
  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }

  if (message.sender_id !== userId) {
    return res.status(403).json({ error: 'Cannot edit another user\'s message' });
  }

  const now = new Date().toISOString();
  run('UPDATE messages SET content = ?, edited_at = ? WHERE id = ?', content.trim(), now, messageId);

  const updatedMessage = {
    ...message,
    content: content.trim(),
    edited_at: now
  };

  logAudit(userId, 'message_edited', messageId, 'User edited message');

  // Broadcast edit to both participants
  const app = getApp();
  const io = app.get('io');
  if (io) {
    const editEvent = {
      ...updatedMessage,
      edited: true,
      editedAt: now
    };
    io.to(message.sender_id).emit('message-edited', editEvent);
    if (message.sender_id !== message.receiver_id) {
      io.to(message.receiver_id).emit('message-edited', editEvent);
    }
  }

  res.json({ success: true, message: updatedMessage });
};

export const getMessageEdits = (req, res) => {
  const userId = req.user.id;
  const { messageId } = req.params;

  const message = get('SELECT * FROM messages WHERE id = ? AND (sender_id = ? OR receiver_id = ?)', messageId, userId, userId);
  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }

  // Return edit history (currently only one edit tracked)
  const history = message.edited_at ? [{
    edited_at: message.edited_at,
    previous_content: message.previous_content || null
  }] : [];

  res.json({ edits: history });
};
