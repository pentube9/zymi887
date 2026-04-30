import { useState, useEffect } from 'react';
import { API_URL } from '../../config/api.js';

function AdminInsightSummary() {
  const [insights, setInsights] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);

    const authHeader = () => {
      const token = localStorage.getItem('adminToken');
      return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };

    try {
      const [statsRes, usersRes, auditRes, reportsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, authHeader()),
        fetch(`${API_URL}/api/admin/users?includeBanned=true`, authHeader()),
        fetch(`${API_URL}/api/admin/audit?limit=10`, authHeader()),
        fetch(`${API_URL}/api/admin/reports`, authHeader())
      ]);

      const unauthorized = [statsRes, usersRes, auditRes, reportsRes].find(r => r.status === 401);
      if (unauthorized) {
        setError('Session expired. Please log in again.');
        return;
      }

      if (!statsRes.ok || !usersRes.ok || !auditRes.ok || !reportsRes.ok) {
        throw new Error('Failed to fetch admin insights');
      }

      const [stats, users, auditLogs, reports] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        auditRes.json(),
        reportsRes.json()
      ]);

      const bannedUsers = users.filter(u => u.is_banned).length;
      const recentActions = auditLogs.slice(0, 5);

      setInsights({
        totalUsers: stats?.totalUsers || 0,
        bannedUsers,
        totalMessages: stats?.totalMessages || 0,
        messagesToday: stats?.messagesToday || 0,
        totalCalls: stats?.totalCalls || 0,
        callsToday: stats?.callsToday || 0,
        failedCallsToday: stats?.failedCallsToday || 0,
        activeConnections: stats?.activeConnections || 0,
        activeCalls: stats?.activeCalls || 0,
        activeReports: Array.isArray(reports) ? reports.length : 0,
        recentActions: Array.isArray(auditLogs) ? recentActions : [],
        serverUptime: stats?.serverUptime || 0,
        databaseStatus: stats?.dbStatus || 'unknown'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiAnalysis = async () => {
    setAiLoading(true);
    const authHeader = () => {
      const token = localStorage.getItem('adminToken');
      return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };

    try {
      const res = await fetch(`${API_URL}/api/admin/ai-analysis`, authHeader());
      if (res.status === 401) {
        setError('Session expired. Please log in again.');
        return;
      }
      if (!res.ok) throw new Error('AI analysis failed');
      const data = await res.json();
      setAiAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
      setAiAnalysis('Could not generate AI analysis at this time.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const formatAction = (action) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="status-section">
        <h2><span>📊</span>Admin Insight Summary</h2>
        <div className="loading-state">Loading insights...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-section">
        <h2><span>📊</span>Admin Insight Summary</h2>
        <div className="error-state">Error: {error}</div>
        <button className="action-btn primary" onClick={fetchInsights}>Retry</button>
      </div>
    );
  }

  return (
    <div className="status-section">
      <h2><span>📊</span>Admin Insight Summary</h2>
      <button className="action-btn primary refresh-button" onClick={fetchInsights}>
        🔄 Refresh Data
      </button>

      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-icon">👥</div>
          <div className="insight-value">{insights.totalUsers}</div>
          <div className="insight-label">Total Users</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">🚫</div>
          <div className="insight-value">{insights.bannedUsers}</div>
          <div className="insight-label">Banned Users</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">💬</div>
          <div className="insight-value">{insights.totalMessages}</div>
          <div className="insight-label">Total Messages</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">📝</div>
          <div className="insight-value">{insights.messagesToday}</div>
          <div className="insight-label">Messages Today</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">📞</div>
          <div className="insight-value">{insights.totalCalls}</div>
          <div className="insight-label">Total Calls</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">📞</div>
          <div className="insight-value">{insights.callsToday}</div>
          <div className="insight-label">Calls Today</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">❌</div>
          <div className="insight-value">{insights.failedCallsToday}</div>
          <div className="insight-label">Failed Calls Today</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">🔌</div>
          <div className="insight-value">{insights.activeConnections}</div>
          <div className="insight-label">Active Connections</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">📹</div>
          <div className="insight-value">{insights.activeCalls}</div>
          <div className="insight-label">Active Calls</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">🚩</div>
          <div className="insight-value">{insights.activeReports}</div>
          <div className="insight-label">Active Reports</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">⏱️</div>
          <div className="insight-value">{formatUptime(insights.serverUptime)}</div>
          <div className="insight-label">Server Uptime</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">🗄️</div>
          <div className="insight-value">{insights.databaseStatus}</div>
          <div className="insight-label">Database Status</div>
        </div>
      </div>

      <div className="ai-analysis-section">
        <h3><span>🧠</span>Admin AI Analysis</h3>
        {aiAnalysis ? (
          <div className="ai-summary-card">
            <p>{aiAnalysis}</p>
            <button className="action-btn secondary small" onClick={fetchAiAnalysis} disabled={aiLoading}>
              {aiLoading ? '🔄 Regenerating...' : '🔄 Refresh AI Analysis'}
            </button>
          </div>
        ) : (
          <div className="ai-empty-state">
            <p>Get a premium AI-powered summary of your system health.</p>
            <button className="action-btn primary" onClick={fetchAiAnalysis} disabled={aiLoading}>
              {aiLoading ? '🔄 Generating...' : '✨ Generate AI Analysis'}
            </button>
          </div>
        )}
      </div>

      <div className="recent-actions">
        <h3>Recent Admin Actions</h3>
        <div className="actions-list">
          {insights?.recentActions?.map((action, index) => (
            <div key={index} className="action-item">
              <div className="action-icon">⚙️</div>
              <div className="action-content">
                <div className="action-type">{formatAction(action?.action || 'unknown')}</div>
                <div className="action-details">
                  By {action?.admin_username || 'Unknown'} • {action?.timestamp ? new Date(action.timestamp).toLocaleString() : 'Unknown time'}
                </div>
                {action?.details && <div className="action-extra">{action.details}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminInsightSummary;