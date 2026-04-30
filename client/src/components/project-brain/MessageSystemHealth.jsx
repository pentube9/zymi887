import { useState, useEffect } from 'react';
import { API_URL } from '../../config/api.js';

function MessageSystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);

    const authHeader = () => {
      const token = localStorage.getItem('adminToken');
      return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };

    try {
      const res = await fetch(`${API_URL}/api/admin/message-health`, authHeader());
      if (!res.ok) throw new Error('Failed to fetch message health');
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const getHealthColor = (score) => {
    if (score >= 80) return 'var(--neon-success)';
    if (score >= 60) return 'var(--neon-warning)';
    return 'var(--neon-danger)';
  };

  if (loading) {
    return (
      <div className="status-section">
        <h2><span>💬</span>Message System Health</h2>
        <div className="loading-state">Loading message health...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-section">
        <h2><span>💬</span>Message System Health</h2>
        <div className="error-state">Error: {error}</div>
        <button className="action-btn primary refresh-button" onClick={fetchHealth}>Retry</button>
      </div>
    );
  }

  return (
    <div className="status-section">
      <h2><span>💬</span>Message System Health</h2>
      <button className="action-btn primary refresh-button" onClick={fetchHealth}>
        🔄 Refresh Data
      </button>

      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-icon">📊</div>
          <div className="insight-value">{health.totalMessages}</div>
          <div className="insight-label">Total Messages</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">📅</div>
          <div className="insight-value">{health.messagesToday}</div>
          <div className="insight-label">Messages Today</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">📈</div>
          <div className="insight-value">{health.messagesLast7Days}</div>
          <div className="insight-label">Last 7 Days</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">🚩</div>
          <div className="insight-value">{health.reportedMessages}</div>
          <div className="insight-label">Reported</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">🚫</div>
          <div className="insight-value">{health.blockedMessageRisk}</div>
          <div className="insight-label">Blocked Risk</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">💾</div>
          <div className="insight-value">{health.persistenceStatus}</div>
          <div className="insight-label">Persistence</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">🕒</div>
          <div className="insight-value">
            {health.latestMessageAt ? new Date(health.latestMessageAt).toLocaleString() : 'None'}
          </div>
          <div className="insight-label">Latest Message</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon" style={{ color: getHealthColor(health.healthScore) }}>❤️</div>
          <div className="insight-value" style={{ color: getHealthColor(health.healthScore) }}>
            {health.healthScore}%
          </div>
          <div className="insight-label">Health Score</div>
        </div>
      </div>

      {health.warnings && health.warnings.length > 0 && (
        <div className="warnings-section">
          <h3>Warnings</h3>
          <ul>
            {health.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MessageSystemHealth;