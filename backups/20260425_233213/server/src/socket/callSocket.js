import { SOCKET_EVENTS } from '../../../shared/socketEvents.js';
import { incrementCallsToday, incrementFailedCalls } from '../services/metricsService.js';
import { logAudit } from '../services/auditService.js';
import { startCall, endCall, rejectCall as rejectCallDB, getCurrentCall } from '../services/callHistoryService.js';
import { CALL_TIMEOUT_MS, addPendingCall, removePendingCall, startCallTimeout, clearCallTimeout, handleCallTimeout } from '../services/callStateService.js';

const checkToken = (socket, userId) => {
  const user = require('../db/database.js').get('SELECT token_version FROM users WHERE id = ?', userId);
  if (user && socket.tokenVersion !== user.token_version) {
    return false;
  }
  return true;
};

export const setupCallSocket = (io, userSockets, callActivity) => {
  io.on('connection', (socket) => {
    socket.on(SOCKET_EVENTS.CALL_USER, ({ to, from, offer, type }) => {
      // Verify caller token
      if (!socket.tokenVersion || !checkToken(socket, from)) {
        socket.disconnect();
        return;
      }

      callActivity.totalCalls++;
      incrementCallsToday();

      const targetSocketId = userSockets.get(to);
      if (!targetSocketId) {
        incrementFailedCalls();
        socket.emit(SOCKET_EVENTS.CALL_REJECTED, { reason: 'User offline' });
        return;
      }

      // Check if receiver blocked caller (via blockService)
      const { isBlocked } = require('../routes/blockRoutes.js');
      if (isBlocked(to, from)) {
        socket.emit(SOCKET_EVENTS.CALL_REJECTED, { reason: 'Cannot call this user' });
        callActivity.totalCalls--;
        return;
      }

      const call = startCall(from, to, type);
      addPendingCall(from, to, offer, type);

      startCallTimeout(() => {
        if (removePendingCall(from)) {
          const timedOutCall = handleCallTimeout(from);
          if (timedOutCall) {
            io.to(userSockets.get(from))?.emit(SOCKET_EVENTS.CALL_TIMEOUT, { to, callId: timedOutCall.id });
            io.to(targetSocketId).emit(SOCKET_EVENTS.CALL_REJECTED, { reason: 'Call timed out' });
            logAudit(from, 'call_timeout', to, `Call timed out after ${CALL_TIMEOUT_MS}ms`);
          }
        }
      });

      io.to(targetSocketId).emit(SOCKET_EVENTS.INCOMING_CALL, { from, offer, type });
      logAudit(from, 'call_started', to, `Call initiated: ${type}`);
    });

    socket.on(SOCKET_EVENTS.MAKE_ANSWER, ({ to, answer }) => {
      if (!socket.tokenVersion || !checkToken(socket, socket.userId)) {
        socket.disconnect();
        return;
      }
      callActivity.activeCalls++;
      clearCallTimeout();
      const currentCall = getCurrentCall();
      if (currentCall) {
        endCall(currentCall.id, 'accepted');
      }
      removePendingCall(socket.userId);

      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit(SOCKET_EVENTS.CALL_ANSWER, { answer });
      }
    });

    socket.on(SOCKET_EVENTS.ICE_CANDIDATE, ({ to, candidate }) => {
      if (!socket.tokenVersion || !checkToken(socket, socket.userId)) {
        socket.disconnect();
        return;
      }
      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit(SOCKET_EVENTS.ICE_CANDIDATE, { candidate });
      }
    });

    socket.on(SOCKET_EVENTS.END_CALL, ({ to }) => {
      if (!socket.tokenVersion || !checkToken(socket, socket.userId)) {
        socket.disconnect();
        return;
      }
      callActivity.activeCalls = Math.max(0, callActivity.activeCalls - 1);
      clearCallTimeout();
      const currentCall = getCurrentCall();
      if (currentCall) {
        endCall(currentCall.id, 'ended');
      }
      removePendingCall(socket.userId);

      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit(SOCKET_EVENTS.CALL_ENDED);
      }
    });

    socket.on(SOCKET_EVENTS.REJECT_CALL, ({ to }) => {
      if (!socket.tokenVersion || !checkToken(socket, socket.userId)) {
        socket.disconnect();
        return;
      }
      clearCallTimeout();
      const currentCall = getCurrentCall();
      if (currentCall) {
        rejectCallDB(currentCall.id);
      }
      removePendingCall(socket.userId);

      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit(SOCKET_EVENTS.CALL_REJECTED);
      }
      logAudit(socket.userId, 'call_rejected', to, 'Call rejected');
    });
  });
};