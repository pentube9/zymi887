import { SOCKET_EVENTS } from '../../shared/socketEvents.js';
import { get, all, run } from '../db/database.js';
import { incrementMessagesToday, incrementTypingEvents, incrementDisconnects } from '../services/metricsService.js';
import { shouldBroadcastOnline } from '../services/presenceService.js';
import { getUserSocketRegistry } from './userSocketRegistry.js';
import { cleanupUserActiveCall } from './callState.js';

const checkToken = (socket, userId) => {
  try {
    if (!userId) return true; // Skip check if no userId
    const user = get('SELECT token_version FROM users WHERE id = ?', userId);
    if (user && socket.tokenVersion !== user.token_version) {
      return false;
    }
    return true;
  } catch (err) {
    console.error('[CHAT_SOCKET] checkToken error:', err);
    return true; // Allow connection on DB failure to prevent crashes
  }
};

export const setupChatSocket = (io, userSockets) => {
  io.on('connection', (socket) => {
    console.log('[SOCKET] User connected:', socket.id);

    socket.on(SOCKET_EVENTS.JOIN, (userId) => {
      try {
        if (!userId) return;

        // Normalize userId to string for consistent Map lookups
        const normalizedUserId = String(userId);
        console.log('[SOCKET] JOIN received:', userId, '-> normalized:', normalizedUserId);

        const user = get('SELECT is_banned, role, token_version, online_visibility FROM users WHERE id = ?', normalizedUserId);

        if (user && user.is_banned) {
          socket.emit(SOCKET_EVENTS.BANNED, { reason: 'Your account has been suspended' });
          socket.disconnect();
          return;
        }

        socket.userId = normalizedUserId;
        socket.userRole = user?.role || 'user';
        socket.tokenVersion = user?.token_version || 1;
        socket.onlineVisibility = user?.online_visibility !== false; // default true

        userSockets.set(normalizedUserId, socket.id);

        // Shadow write to Redis registry (dev-only)
        if (process.env.REDIS_SOCKET_REGISTRY_SHADOW === 'true' && process.env.NODE_ENV !== 'production') {
          try {
            const registry = getUserSocketRegistry();
            registry.setUserSocket(userId, socket.id);
          } catch (error) {
            console.error('[JOIN] Shadow write failed:', error.message);
          }
        }

        // Only broadcast online status if visibility is enabled
        if (shouldBroadcastOnline(userId)) {
          socket.broadcast.emit(SOCKET_EVENTS.USER_ONLINE, { userId: String(userId) });
        }

        console.log('[SOCKET] User joined:', userId);
      } catch (err) {
        console.error('[CHAT_SOCKET] JOIN error:', err);
      }
    });

socket.on(SOCKET_EVENTS.PRIVATE_MESSAGE, (data) => {
      try {
        let { to, from, content, tempId, message_type, file_url, file_name, file_size, mime_type, location_lat, location_lng } = data || {};

        // Normalize IDs to string for consistent lookups
        to = String(to);
        from = String(from);

        if (!to || !from) return;

        // Token version check
        if (!socket.tokenVersion || !checkToken(socket, socket.userId)) {
          socket.disconnect();
          return;
        }

        const targetUser = get('SELECT is_banned FROM users WHERE id = ?', to);
        if (targetUser?.is_banned) return;

        // Build message content - fallback to type description if media
        const messageContent = content || (message_type === 'location' ? 'Shared location' : 'Media');

        // Insert with optional media fields
        const result = run(
          'INSERT INTO messages (sender_id, receiver_id, content, message_type, file_url, file_name, file_size, mime_type, location_lat, location_lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          from, to, messageContent, message_type || 'text', file_url || null, file_name || null, file_size || null, mime_type || null, location_lat || null, location_lng || null
        );

        const message = {
          id: result.lastInsertRowid,
          sender_id: from,
          receiver_id: to,
          content: messageContent,
          message_type: message_type || 'text',
          file_url,
          file_name,
          file_size,
          mime_type,
          location_lat,
          location_lng,
          timestamp: new Date().toISOString(),
          tempId
        };

        io.to(socket.id).emit(SOCKET_EVENTS.NEW_MESSAGE, message);
        io.to(socket.id).emit('receive_message', message);
        io.to(socket.id).emit('message-sent', { tempId, id: message.id });

        const targetSocketId = userSockets.get(to);
        if (targetSocketId) {
          io.to(targetSocketId).emit(SOCKET_EVENTS.NEW_MESSAGE, { ...message, tempId: undefined });
          io.to(targetSocketId).emit('receive_message', { ...message, tempId: undefined });
        }

        incrementMessagesToday();
      } catch (err) {
        console.error('[CHAT_SOCKET] PRIVATE_MESSAGE error:', err);
      }
    });

    socket.on(SOCKET_EVENTS.TYPING, (data) => {
      try {
        const { to, from } = data || {};
        if (!to) return;

        const targetSocketId = userSockets.get(String(to)) || userSockets.get(to);
        if (targetSocketId) {
          io.to(targetSocketId).emit(SOCKET_EVENTS.USER_TYPING, { from: String(from) });
        }
        incrementTypingEvents();
      } catch (err) {
        console.error('[CHAT_SOCKET] TYPING error:', err);
      }
    });

    socket.on(SOCKET_EVENTS.STOP_TYPING, (data) => {
      try {
        const { to, from } = data || {};
        if (!to) return;

        const targetSocketId = userSockets.get(String(to)) || userSockets.get(to);
        if (targetSocketId) {
          io.to(targetSocketId).emit(SOCKET_EVENTS.USER_STOP_TYPING, { from: String(from) });
        }
      } catch (err) {
        console.error('[CHAT_SOCKET] STOP_TYPING error:', err);
      }
    });

    socket.on('message-delivered', (data) => {
      try {
        const { messageId, senderId, receiverId } = data || {};
        if (!messageId || !senderId) return;
        
        const senderSocketId = userSockets.get(String(senderId));
        if (senderSocketId) {
          io.to(senderSocketId).emit('message-status-update', { messageId, status: 'delivered', receiverId });
        }
      } catch (err) {
        console.error('[CHAT_SOCKET] message-delivered error:', err);
      }
    });

    socket.on('message-read', (data) => {
      try {
        const { messageId, senderId, receiverId } = data || {};
        if (!messageId || !senderId) return;
        
        run('UPDATE messages SET is_read = 1 WHERE id = ?', messageId);
        
        const senderSocketId = userSockets.get(String(senderId));
        if (senderSocketId) {
          io.to(senderSocketId).emit('message-status-update', { messageId, status: 'read', receiverId });
        }
      } catch (err) {
        console.error('[CHAT_SOCKET] message-read error:', err);
      }
    });

    socket.on('disconnect', () => {
      try {
        if (socket.userId) {
          userSockets.delete(socket.userId);

          // Clean up any active call for this user
          cleanupUserActiveCall(socket.userId, io, userSockets);

          // Shadow delete from Redis registry (dev-only)
          if (process.env.REDIS_SOCKET_REGISTRY_SHADOW === 'true' && process.env.NODE_ENV !== 'production') {
            try {
              const registry = getUserSocketRegistry();
              registry.deleteUserSocket(socket.userId);
            } catch (error) {
              console.error('[DISCONNECT] Shadow delete failed:', error.message);
            }
          }

          // Only broadcast offline if user was visible to others
          if (socket.onlineVisibility !== false) {
            socket.broadcast.emit(SOCKET_EVENTS.USER_OFFLINE, { userId: String(socket.userId) });
          }
          incrementDisconnects();
        }
        console.log('[SOCKET] User disconnected:', socket.id);
      } catch (err) {
        console.error('[CHAT_SOCKET] disconnect error:', err);
      }
    });

    socket.on('reconnect', () => {
      // On reconnect, a new join event will be emitted by client. We'll update tokenVersion then.
    });
  });
};