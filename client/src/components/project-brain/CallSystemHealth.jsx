import { useState, useEffect } from 'react';
import { API_URL } from '../../config/api.js';

function CallSystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSuccess, setLastSuccess] = useState(null);

  const fetchHealth = async (signal) => {
    setLoading(true);
    
    const authHeader = () => {
      const token = localStorage.getItem('adminToken');
      return token ? { Authorization: `Bearer ${token}` } : {};
    };

    try {
      const res = await fetch(`${API_URL}/api/admin/call-health`, {
        ...authHeader(),
        signal
      });
      
      if (res.status === 401 || res.status === 403) {
        // Handle session expiry elsewhere or here if needed
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to fetch call health');
      }

      const data = await res.json();
      setHealth(data);
      setLastSuccess(new Date());
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[CallHealth] Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchHealth(controller.signal);
    return () => controller.abort();
  }, []);

  const getHealthColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="zy-admin-section">
      <div className="section-header">
        <h2><span>📞</span>Call System Health</h2>
        <div className="header-actions">
          {lastSuccess && <span className="last-sync">Last sync: {lastSuccess.toLocaleTimeString()}</span>}
          <button className="zy-admin-btn small" onClick={() => fetchHealth()} disabled={loading}>
            {loading ? '...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="zy-admin-error-card">
          <p>Call health data unavailable</p>
          <small>{error}</small>
          <button className="zy-admin-btn primary small" onClick={() => fetchHealth()}>Retry Now</button>
        </div>
      ) : loading && !health ? (
        <div className="zy-loading-placeholder">Analyzing call metrics...</div>
      ) : health ? (
        <>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-value">{health.totalCalls}</div>
              <div className="insight-label">Total Calls</div>
            </div>
            <div className="insight-card">
              <div className="insight-value">{health.callsToday}</div>
              <div className="insight-label">Calls Today</div>
            </div>
            <div className="insight-card">
              <div className="insight-value">{health.activeCalls || 0}</div>
              <div className="insight-label">Live Calls</div>
            </div>
            <div className="insight-card">
              <div className="insight-value">{health.failedCallsToday || 0}</div>
              <div className="insight-label">Failed Today</div>
            </div>
            <div className="insight-card">
              <div className="insight-value">{formatDuration(health.averageCallDuration)}</div>
              <div className="insight-label">Avg Duration</div>
            </div>
            <div className="insight-card">
              <div className="insight-value capitalize" style={{ color: getHealthColor(health.healthScore) }}>
                {health.health || 'stable'}
              </div>
              <div className="insight-label">Status</div>
            </div>
          </div>

          {health.warnings && health.warnings.length > 0 && (
            <div className="zy-admin-warnings">
              {health.warnings.map((w, i) => <div key={i} className="warning-item">⚠️ {w}</div>)}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

export default CallSystemHealth;