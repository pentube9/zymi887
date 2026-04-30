import { SOCKET_EVENTS } from '../../../shared/socketEvents.js';
import { get, run } from '../db/database.js';
import { incrementMessagesToday, incrementTypingEvents, incrementDisconnects } from '../services/metricsService.js';
import { shouldBroadcastOnline } from '../services/presenceService.js';

const checkToken = (socket, userId) => {
  const user = get('SELECT token_version FROM users WHERE id = ?', userId);
  if (user && socket.tokenVersion !== user.token_version) {
    return false;
  }
  return true;
};

export const setupChatSocket = (io, userSockets) => {
  io.on('connection', (socket) => {
    console.log('[SOCKET] User connected:', socket.id);

    socket.on(SOCKET_EVENTS.JOIN, (userId) => {
      const user = get('SELECT is_banned, role, token_version, online_visibility FROM users WHERE id = ?', userId);

      if (user && user.is_banned) {
        socket.emit(SOCKET_EVENTS.BANNED, { reason: 'Your account has been suspended' });
        socket.disconnect();
        return;
      }

      socket.userId = userId;
      socket.userRole = user?.role || 'user';
      socket.tokenVersion = user?.token_version || 1;
      socket.onlineVisibility = user?.online_visibility !== false; // default true

      userSockets.set(userId, socket.id);

      // Only broadcast online status if visibility is enabled
      if (shouldBroadcastOnline(userId)) {
        socket.broadcast.emit(SOCKET_EVENTS.USER_ONLINE, userId);
      }

      console.log('[SOCKET] User joined:', userId);
    });

    socket.on(SOCKET_EVENTS.PRIVATE_MESSAGE, ({ to, from, content }) => {
      // Token version check
      if (!socket.tokenVersion || !checkToken(socket, socket.userId)) {
        socket.disconnect();
        return;
      }

      const targetUser = get('SELECT is_banned FROM users WHERE id = ?', to);
      if (targetUser?.is_banned) return;

      const result = run(
        'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
        from, to, content
      );

      const message = {
        id: result.lastInsertRowid,
        sender_id: from,
        receiver_id: to,
        content,
        timestamp: new Date().toISOString()
      };

      io.to(socket.id).emit(SOCKET_EVENTS.NEW_MESSAGE, message);

      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit(SOCKET_EVENTS.NEW_MESSAGE, message);
      }

      incrementMessagesToday();
    });

    socket.on(SOCKET_EVENTS.TYPING, ({ to }) => {
      if (!socket.tokenVersion || !checkToken(socket, socket.userId)) {
        socket.disconnect();
        return;
      }
      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit(SOCKET_EVENTS.USER_TYPING, { from: socket.userId });
      }
      incrementTypingEvents();
    });

    socket.on(SOCKET_EVENTS.STOP_TYPING, ({ to }) => {
      if (!socket.tokenVersion || !checkToken(socket, socket.userId)) {
        socket.disconnect();
        return;
      }
      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit(SOCKET_EVENTS.USER_STOP_TYPING, { from: socket.userId });
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        userSockets.delete(socket.userId);
        // Only broadcast offline if user was visible to others
        if (socket.onlineVisibility !== false) {
          socket.broadcast.emit(SOCKET_EVENTS.USER_OFFLINE, socket.userId);
        }
        incrementDisconnects();
      }
      console.log('[SOCKET] User disconnected:', socket.id);
    });

    socket.on('reconnect', () => {
      // On reconnect, a new join event will be emitted by client. We'll update tokenVersion then.
    });
  });
};