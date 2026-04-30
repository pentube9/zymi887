import React, { useState } from 'react';

const GovernanceSimulator = () => {
  const [params, setParams] = useState({
    featureKey: 'nearby_enabled',
    userId: '',
    countryCode: '',
    cityName: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/admin/features/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(params)
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="zy-admin-card glass">
      <div className="zy-card-header">
        <h3>Access Simulator</h3>
        <p>Test how the governance priority tree evaluates access for specific scenarios</p>
      </div>

      <form className="zy-admin-form" onSubmit={handleSimulate}>
        <div className="zy-form-grid">
          <div className="zy-form-group">
            <label>Feature Key</label>
            <select 
              value={params.featureKey}
              onChange={e => setParams({...params, featureKey: e.target.value})}
            >
              <option value="nearby_enabled">Nearby Discovery</option>
              <option value="file_sharing_enabled">File Sharing</option>
              <option value="video_call_enabled">Video Call</option>
              <option value="audio_call_enabled">Audio Call</option>
              <option value="location_sharing_enabled">Location Sharing</option>
              <option value="ai_analysis_enabled">AI Analysis</option>
              <option value="report_system_enabled">Report System</option>
            </select>
          </div>
          <div className="zy-form-group">
            <label>User ID (Simulated)</label>
            <input 
              type="number" 
              placeholder="Leave empty for guest" 
              value={params.userId}
              onChange={e => setParams({...params, userId: e.target.value})}
            />
          </div>
          <div className="zy-form-group">
            <label>Country Code</label>
            <input 
              type="text" 
              placeholder="e.g. BD" 
              value={params.countryCode}
              onChange={e => setParams({...params, countryCode: e.target.value.toUpperCase()})}
            />
          </div>
          <div className="zy-form-group">
            <label>City Name</label>
            <input 
              type="text" 
              placeholder="e.g. Dhaka" 
              value={params.cityName}
              onChange={e => setParams({...params, cityName: e.target.value})}
            />
          </div>
        </div>
        <button type="submit" className="zy-admin-btn primary" disabled={loading}>
          {loading ? 'Evaluating...' : 'Run Simulation'}
        </button>
      </form>

      {result && (
        <div className="zy-simulation-result">
          <div className={`zy-result-badge ${result.allowed ? 'allowed' : 'denied'}`}>
            {result.allowed ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
          </div>
          
          <div className="zy-result-details">
            <div className="zy-detail-item">
              <span className="label">Matched Level:</span>
              <span className="value capitalize">{result.level}</span>
            </div>
            <div className="zy-detail-item">
              <span className="label">Reason:</span>
              <span className="value">{result.reason}</span>
            </div>
            <div className="zy-detail-item">
              <span className="label">Evaluated At:</span>
              <span className="value">{new Date(result.evaluatedAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="zy-priority-indicator">
            <div className={`step ${result.level === 'user' ? 'active' : ''}`}>User</div>
            <div className="arrow">→</div>
            <div className={`step ${result.level === 'city' ? 'active' : ''}`}>City</div>
            <div className="arrow">→</div>
            <div className={`step ${result.level === 'country' ? 'active' : ''}`}>Country</div>
            <div className="arrow">→</div>
            <div className={`step ${result.level === 'global' ? 'active' : ''}`}>Global</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernanceSimulator;
