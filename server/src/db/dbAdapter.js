import * as sqliteAdapter from './sqliteAdapter.js';
import * as postgresAdapter from './postgresAdapter.js';
import { isPostgresReady } from '../db/postgres.js';
import { config } from '../config/env.js';

let usePostgres = false;

export const setPostgresMode = (enabled) => {
  usePostgres = enabled;
};

export const isPostgresMode = () => usePostgres && isPostgresReady();

export const shouldUsePostgres = () => {
  return usePostgres && isPostgresReady();
};

const adapter = shouldUsePostgres() ? postgresAdapter : sqliteAdapter;

export const get = (...args) => adapter.get(...args);
export const all = (...args) => adapter.all(...args);
export const run = (...args) => adapter.run(...args);
export const exec = (...args) => adapter.exec(...args);
export const prepare = (...args) => adapter.prepare(...args);
export const getLastInsertRowid = () => adapter.getLastInsertRowid();

export const userExists = (userId) => adapter.userExists(userId);
export const getUserById = (userId) => adapter.getUserById(userId);
export const getUserByUsername = (username) => adapter.getUserByUsername(username);
export const createUser = (username, passwordHash, role) => adapter.createUser(username, passwordHash, role);
export const updateUserTokenVersion = (userId) => adapter.updateUserTokenVersion(userId);

export const createMessage = (senderId, receiverId, content) => adapter.createMessage(senderId, receiverId, content);
export const getMessagesBetweenUsers = (userId, otherId) => adapter.getMessagesBetweenUsers(userId, otherId);
export const markMessageAsRead = (messageId, userId) => adapter.markMessageAsRead(messageId, userId);
export const hideMessage = (messageId, userId) => adapter.hideMessage(messageId, userId);
export const deleteMessage = (messageId, userId) => adapter.deleteMessage(messageId, userId);
export const editMessageContent = (messageId, newContent, userId) => adapter.editMessageContent(messageId, newContent, userId);
export const getMessageEdits = (messageId) => adapter.getMessageEdits(messageId);
export const searchMessages = (userId, query) => adapter.searchMessages(userId, query);
export const getUnreadCount = (userId) => adapter.getUnreadCount(userId);

export const createBlock = (blockerId, blockedUserId) => adapter.createBlock(blockerId, blockedUserId);
export const removeBlock = (blockerId, blockedUserId) => adapter.removeBlock(blockerId, blockedUserId);
export const isUserBlocked = (blockerId, targetId) => adapter.isUserBlocked(blockerId, targetId);
export const getBlockedUsers = (userId) => adapter.getBlockedUsers(userId);

export const createCallHistory = (callerId, receiverId, callType) => adapter.createCallHistory(callerId, receiverId, callType);
export const updateCallHistory = (callId, status) => adapter.updateCallHistory(callId, status);
export const getCallHistory = (userId) => adapter.getCallHistory(userId);

export const createReport = (reporterId, messageId, reason) => adapter.createReport(reporterId, messageId, reason);
export const getReports = () => adapter.getReports();
export const resolveReport = (reportId, status) => adapter.resolveReport(reportId, status);

export const createAuditLog = (adminId, action, targetUserId, details) => adapter.createAuditLog(adminId, action, targetUserId, details);
export const getAuditLogs = (limit) => adapter.getAuditLogs(limit);

export const getMetrics = () => adapter.getMetrics();
export const updateMetric = (key, value) => adapter.updateMetric(key, value);
export const incrementMetric = (key) => adapter.incrementMetric(key);