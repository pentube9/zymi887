import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';

dotenv.config();

import { initDatabase } from './src/db/database.js';
initDatabase();

import { runMigrations } from './src/db/migrations.js';
runMigrations();

import { initAdminSeed } from './src/config/adminSeed.js';
initAdminSeed();

import { createBlockTable } from './src/services/blockService.js';
createBlockTable();

import { createReportsTable } from './src/services/reportService.js';
createReportsTable();

import { createCallHistoryTable } from './src/services/callHistoryService.js';
createCallHistoryTable();

import { initCallState } from './src/services/callStateService.js';
initCallState();

import { initMetrics } from './src/services/metricsService.js';
initMetrics();
import { logAudit } from './src/services/auditService.js';

import { setupCallSocket } from './src/socket/callSocket.js';
import { setupChatSocket } from './src/socket/chatSocket.js';
import { get, run } from './src/db/database.js';
import { isBlocked } from './src/routes/blockRoutes.js';

import { register, login, adminLogin } from './src/routes/authRoutes.js';
import { getUsers, getMessages, searchMessages, getUnread, markAsRead } from './src/routes/messageRoutes.js';
import { editMessage, getMessageEdits } from './src/routes/messageEditRoutes.js';
import { getProfile, updateProfile, getUserSettings, updateUserSettings, changePassword as changeUserPassword } from './src/routes/profileRoutes.js';
import {
  getStats, getUsers as getAdminUsers, banUser, unbanUser,
  getAudit, getRisks, getPermissions, updateUserRole, getMigrationStatus, changePassword as changeAdminPassword, exportData
} from './src/routes/adminRoutes.js';
import { requireAdmin } from './src/middleware/adminMiddleware.js';
import { requireAuth } from './src/middleware/authMiddleware.js';
import { block, unblock, checkBlock, listBlocked } from './src/routes/blockRoutes.js';
import { reportMessage, getAllReports, resolveMessageReport } from './src/routes/reportRoutes.js';
import { getUserCallHistory } from './src/routes/callHistoryRoutes.js';
import { uploadAvatar, getAvatar, deleteUserAvatar } from './src/routes/uploadRoutes.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Public routes
app.post('/api/register', register);
app.post('/api/login', login);
app.post('/api/admin/login', (req, res) => {
  adminLogin(req, res);
  logAudit(null, 'admin_login_attempt', null, `Login attempt: ${req.body.username}`);
});

// Protected user routes
app.get('/api/users', requireAuth, getUsers);
app.get('/api/messages/:userId/:otherId', requireAuth, getMessages);
app.get('/api/messages/search/:userId', requireAuth, searchMessages);
app.get('/api/unread/:userId', requireAuth, getUnread);
app.post('/api/messages/read', requireAuth, markAsRead);
app.put('/api/messages/:messageId/edit', requireAuth, editMessage);
app.get('/api/messages/:messageId/edits', requireAuth, getMessageEdits);

app.get('/api/profile/:userId', requireAuth, getProfile);
app.put('/api/profile/:userId', requireAuth, updateProfile);
app.get('/api/settings/:userId', requireAuth, getUserSettings);
app.put('/api/settings/:userId', requireAuth, updateUserSettings);
app.post('/api/profile/:userId/password', requireAuth, changeUserPassword);

app.post('/api/block/:userId', requireAuth, block);
app.delete('/api/block/:userId', requireAuth, unblock);
app.get('/api/block/:userId', requireAuth, listBlocked);
app.get('/api/block/:userId/:targetId', requireAuth, checkBlock);

app.post('/api/report', requireAuth, reportMessage);
app.get('/api/calls/:userId', requireAuth, getUserCallHistory);

app.post('/api/upload/avatar', requireAuth, uploadAvatar);
app.get('/api/avatar/:userId', getAvatar);
app.delete('/api/upload/avatar', requireAuth, deleteUserAvatar);

app.get('/api/admin/stats', requireAdmin, getStats);
app.get('/api/admin/users', requireAdmin, getAdminUsers);
app.post('/api/admin/ban', requireAdmin, banUser);
app.post('/api/admin/unban', requireAdmin, unbanUser);
app.get('/api/admin/audit', requireAdmin, getAudit);
app.get('/api/admin/risks', requireAdmin, getRisks);
app.get('/api/admin/reports', requireAdmin, getAllReports);
app.post('/api/admin/reports/resolve', requireAdmin, resolveMessageReport);
app.get('/api/admin/permissions', requireAdmin, getPermissions);
app.post('/api/admin/role', requireAdmin, updateUserRole);
app.post('/api/admin/password', requireAdmin, changeAdminPassword);
app.get('/api/admin/export', requireAdmin, exportData);
app.get('/api/admin/migrations', requireAdmin, getMigrationStatus);

const userSockets = new Map();
const callActivity = { activeCalls: 0, totalCalls: 0, failedCalls: 0 };
const serverStartTime = Date.now();

app.set('userSockets', userSockets);
app.set('callActivity', callActivity);
app.set('io', io);
app.set('serverStartTime', serverStartTime);

// Socket setup with modular handlers
setupCallSocket(io, userSockets, callActivity);
setupChatSocket(io, userSockets);

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`ZYMI server running on http://localhost:${PORT}`);
});

export const getApp = () => app;