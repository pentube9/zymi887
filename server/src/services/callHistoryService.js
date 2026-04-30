import { exec, get, all, run } from '../db/database.js';

const tableExists = (tableName) => {
  const result = get("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", tableName);
  return !!result;
};

export const createCallHistoryTable = () => {
  if (!tableExists('call_history')) {
    exec(`
      CREATE TABLE IF NOT EXISTS call_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        caller_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        call_type TEXT NOT NULL,
        status TEXT NOT NULL,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        answered_at DATETIME,
        ended_at DATETIME,
        duration INTEGER DEFAULT 0,
        FOREIGN KEY (caller_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
      )
    `);
    console.log('[MIGRATION] Created call_history table');
  } else {
    // Check if answered_at column exists, add if missing
    const columns = all('PRAGMA table_info(call_history)');
    if (!columns.some(col => col.name === 'answered_at')) {
      exec('ALTER TABLE call_history ADD COLUMN answered_at DATETIME');
      console.log('[MIGRATION] Added answered_at column to call_history');
    }
  }
};

// Per-caller call registry instead of singleton — supports concurrent calls
const activeCalls = new Map(); // callerId -> { id, callerId, receiverId, startTime }

export const startCall = (callerId, receiverId, callType) => {
  const callerKey = String(callerId);
  const result = run(
    'INSERT INTO call_history (caller_id, receiver_id, call_type, status) VALUES (?, ?, ?, ?)',
    callerId,
    receiverId,
    callType,
    'started'
  );
  const callData = {
    id: result.lastInsertRowid,
    callerId,
    receiverId,
    startTime: Date.now()
  };
  activeCalls.set(callerKey, callData);
  return callData;
};

export const endCall = (callId, status = 'completed') => {
  // Find the call by ID in the map
  let call = null;
  let callerKey = null;
  for (const [key, c] of activeCalls) {
    if (c.id === callId) {
      call = c;
      callerKey = key;
      break;
    }
  }
  if (!call) return null;

  const endedAt = new Date().toISOString();
  const duration = Math.floor((Date.now() - call.startTime) / 1000);

  let answeredAt = null;
  if (status === 'accepted' || status === 'ended') {
    answeredAt = new Date(new Date(call.startTime).getTime() + 5000).toISOString(); // approximate answer time
  }

  run(
    'UPDATE call_history SET status = ?, answered_at = ?, ended_at = ?, duration = ? WHERE id = ?',
    status,
    answeredAt,
    endedAt,
    duration,
    callId
  );

  const ended = { ...call, status, answeredAt, endedAt, duration };
  activeCalls.delete(callerKey);
  return ended;
};

export const missCall = (callId) => {
  let call = null;
  let callerKey = null;
  for (const [key, c] of activeCalls) {
    if (c.id === callId) {
      call = c;
      callerKey = key;
      break;
    }
  }
  if (!call) return null;

  const endedAt = new Date().toISOString();

  run(
    'UPDATE call_history SET status = ?, ended_at = ?, duration = 0 WHERE id = ?',
    'missed',
    endedAt,
    callId
  );

  const ended = { ...call, status: 'missed', endedAt, duration: 0 };
  activeCalls.delete(callerKey);
  return ended;
};

export const rejectCall = (callId) => {
  let call = null;
  let callerKey = null;
  for (const [key, c] of activeCalls) {
    if (c.id === callId) {
      call = c;
      callerKey = key;
      break;
    }
  }
  if (!call) return null;

  const endedAt = new Date().toISOString();

  run(
    'UPDATE call_history SET status = ?, ended_at = ?, duration = 0 WHERE id = ?',
    'rejected',
    endedAt,
    callId
  );

  const ended = { ...call, status: 'rejected', endedAt, duration: 0 };
  activeCalls.delete(callerKey);
  return ended;
};

export const getCallHistory = (userId, limit = 50) => {
  return all(`
    SELECT 
      h.id,
      h.caller_id,
      h.receiver_id,
      h.call_type,
      h.status,
      h.started_at,
      h.ended_at,
      h.duration,
      u.username as caller_username,
      r.username as receiver_username
    FROM call_history h
    JOIN users u ON h.caller_id = u.id
    JOIN users r ON h.receiver_id = r.id
    WHERE h.caller_id = ? OR h.receiver_id = ?
    ORDER BY h.started_at DESC
    LIMIT ?
  `, userId, userId, limit);
};

// Get current call for a specific caller (used by callSocket handlers)
export const getCurrentCall = (callerId) => {
  if (callerId) {
    return activeCalls.get(String(callerId)) || null;
  }
  // Fallback: return most recent call (backward compatibility)
  if (activeCalls.size === 0) return null;
  const entries = Array.from(activeCalls.values());
  return entries[entries.length - 1];
};