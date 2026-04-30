import { getCurrentCall as getHistoryCurrentCall, missCall, rejectCall as rejectCallDB, endCall as endCallDB } from './callHistoryService.js';

export const CALL_TIMEOUT_MS = 30000; // 30 seconds

let pendingCalls = new Map(); // callerId -> { targetId, offer, type, timestamp, timeoutId }
let callTimeoutId = null;

export const initCallState = () => {
  pendingCalls = new Map();
  callTimeoutId = null;
};

export const addPendingCall = (callerId, targetId, offer, type) => {
  // Clear any existing pending call for this caller
  removePendingCall(callerId);

  const timeoutId = setTimeout(() => {
    pendingCalls.delete(callerId);
    if (callTimeoutId === timeoutId) {
      callTimeoutId = null;
    }
  }, CALL_TIMEOUT_MS);

  pendingCalls.set(callerId, {
    targetId,
    offer,
    type,
    timestamp: Date.now(),
    timeoutId
  });
};

export const removePendingCall = (callerId) => {
  const pending = pendingCalls.get(callerId);
  if (pending?.timeoutId) {
    clearTimeout(pending.timeoutId);
  }
  return pendingCalls.delete(callerId);
};

export const getPendingCall = (callerId) => pendingCalls.get(callerId);

export const hasPendingCall = (callerId) => pendingCalls.has(callerId);

export const startCallTimeout = (onTimeout, timeoutMs = CALL_TIMEOUT_MS) => {
  clearCallTimeout();
  callTimeoutId = setTimeout(() => {
    callTimeoutId = null;
    onTimeout();
  }, timeoutMs);
  return callTimeoutId;
};

export const clearCallTimeout = () => {
  if (callTimeoutId) {
    clearTimeout(callTimeoutId);
    callTimeoutId = null;
  }
};

export const getCallState = () => ({
  pendingCalls: Array.from(pendingCalls.keys()),
  hasActiveTimeout: !!callTimeoutId
});

// Timeout handler to be used by callSocket
export const handleCallTimeout = (callerId) => {
  const currentCall = getHistoryCurrentCall();
  if (currentCall) {
    missCall(currentCall.id);
    return currentCall;
  }
  return null;
};
