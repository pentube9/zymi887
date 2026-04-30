let metrics = {
  activeSockets: 0,
  messagesToday: 0,
  callsToday: 0,
  failedCallsToday: 0,
  typingEvents: 0,
  disconnects: 0,
  bannedAttempts: 0,
  adminLoginAttempts: 0,
  failedAdminLogins: 0,
  reconnects: 0,
  messagesPerHour: [],
  callsPerHour: [],
  lastReset: Date.now()
};

let dailyResetTimer = null;

const resetDailyMetrics = () => {
  metrics.messagesToday = 0;
  metrics.callsToday = 0;
  metrics.failedCallsToday = 0;
  metrics.lastReset = Date.now();
  console.log('[METRICS] Daily metrics reset');
};

const startDailyReset = () => {
  if (dailyResetTimer) clearInterval(dailyResetTimer);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const msUntilMidnight = tomorrow - now;
  
  setTimeout(() => {
    resetDailyMetrics();
    dailyResetTimer = setInterval(resetDailyMetrics, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
};

export const initMetrics = () => {
  startDailyReset();
  console.log('[METRICS] Metrics collector initialized');
};

export const getMetrics = () => ({ ...metrics });

export const incrementActiveSockets = () => {
  metrics.activeSockets++;
};

export const decrementActiveSockets = () => {
  metrics.activeSockets = Math.max(0, metrics.activeSockets - 1);
};

export const incrementMessagesToday = () => {
  metrics.messagesToday++;
};

export const incrementCallsToday = () => {
  metrics.callsToday++;
};

export const incrementFailedCalls = () => {
  metrics.failedCallsToday++;
};

export const incrementTypingEvents = () => {
  metrics.typingEvents++;
};

export const incrementDisconnects = () => {
  metrics.disconnects++;
};

export const incrementBannedAttempts = () => {
  metrics.bannedAttempts++;
};

export const incrementAdminLoginAttempts = () => {
  metrics.adminLoginAttempts++;
};

export const incrementFailedAdminLogins = () => {
  metrics.failedAdminLogins++;
};

export const incrementReconnects = () => {
  metrics.reconnects++;
};

export const getMetricsSummary = () => {
  const uptime = Date.now() - metrics.lastReset;
  return {
    activeSockets: metrics.activeSockets,
    messagesToday: metrics.messagesToday,
    callsToday: metrics.callsToday,
    failedCallsToday: metrics.failedCallsToday,
    typingEvents: metrics.typingEvents,
    disconnects: metrics.disconnects,
    bannedAttempts: metrics.bannedAttempts,
    adminLoginAttempts: metrics.adminLoginAttempts,
    failedAdminLogins: metrics.failedAdminLogins,
    reconnects: metrics.reconnects,
    uptimeMs: uptime,
    uptimeFormatted: formatUptime(Math.floor(uptime / 1000))
  };
};

const formatUptime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
};