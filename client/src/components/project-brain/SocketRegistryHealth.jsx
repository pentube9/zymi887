import { useState, useEffect } from 'react';
import { API_URL } from '../../config/api.js';

function SocketRegistryHealth() {
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
      const res = await fetch(`${API_URL}/api/admin/socket-registry-health`, authHeader());
      if (!res.ok) throw new Error('Failed to fetch socket registry health');
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

  if (loading) {
    return (
      <div className="status-section">
        <h2><span>🔌</span>Socket Registry Health</h2>
        <div className="loading-state">Loading registry health...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-section">
        <h2><span>🔌</span>Socket Registry Health</h2>
        <div className="error-state">Error: {error}</div>
        <button className="action-btn primary refresh-button" onClick={fetchHealth}>Retry</button>
      </div>
    );
  }

  return (
    <div className="status-section">
      <h2><span>🔌</span>Socket Registry Health</h2>
      <button className="action-btn primary refresh-button" onClick={fetchHealth}>
        🔄 Refresh Data
      </button>

      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-icon">🗺️</div>
          <div className="insight-value">{health.routingMode}</div>
          <div className="insight-label">Routing Mode</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">👥</div>
          <div className="insight-value">{health.localMapSize}</div>
          <div className="insight-label">Active Connections</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">{health.shadowMode ? '👻' : '🚫'}</div>
          <div className="insight-value">{health.shadowMode ? 'Enabled' : 'Disabled'}</div>
          <div className="insight-label">Shadow Mode</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">{health.redisAvailable ? '🟢' : '🔴'}</div>
          <div className="insight-value">{health.redisAvailable ? 'Connected' : 'Disconnected'}</div>
          <div className="insight-label">Redis Status</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">📊</div>
          <div className="insight-value">{health.metrics?.redisOperations || 0}</div>
          <div className="insight-label">Redis Operations</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">❌</div>
          <div className="insight-value">{health.metrics?.redisFailures || 0}</div>
          <div className="insight-label">Redis Failures</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">{health.productionDisabled ? '🔒' : '🔓'}</div>
          <div className="insight-value">{health.productionDisabled ? 'Disabled' : 'Available'}</div>
          <div className="insight-label">Production Safety</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">🕒</div>
          <div className="insight-value">
            {health.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'Unknown'}
          </div>
          <div className="insight-label">Last Update</div>
        </div>
      </div>

      {health.warnings && health.warnings.length > 0 && (
        <div className="warnings-section">
          <h3>Safety Status</h3>
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

export default SocketRegistryHealth;