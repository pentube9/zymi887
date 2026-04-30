import React, { useState, useEffect } from 'react';

const UserFeatureControlPanel = () => {
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({
    userId: '',
    featureKey: 'nearby_enabled',
    enabled: false,
    reason: '',
    expiresAt: ''
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/admin/features/user-rules', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await response.json();
      setRules(data);
    } catch (error) {
      console.error('Error fetching user rules:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/features/user-rules', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(newRule)
      });
      setNewRule({ ...newRule, userId: '', reason: '', expiresAt: '' });
      fetchRules();
    } catch (error) {
      console.error('Error creating user rule:', error);
    }
  };

  return (
    <div className="zy-admin-card glass">
      <div className="zy-card-header">
        <h3>User-Level Restrictions</h3>
        <p>Revoke or Grant features for specific individuals</p>
      </div>

      <form className="zy-admin-form" onSubmit={handleSubmit}>
        <div className="zy-form-grid">
          <div className="zy-form-group">
            <label>User ID</label>
            <input 
              type="number" 
              placeholder="e.g. 1024" 
              value={newRule.userId}
              onChange={e => setNewRule({...newRule, userId: e.target.value})}
              required
            />
          </div>
          <div className="zy-form-group">
            <label>Feature</label>
            <select 
              value={newRule.featureKey} 
              onChange={e => setNewRule({...newRule, featureKey: e.target.value})}
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
            <label>Status</label>
            <select 
              value={newRule.enabled} 
              onChange={e => setNewRule({...newRule, enabled: e.target.value === 'true'})}
            >
              <option value="false">Disabled (Revoke)</option>
              <option value="true">Enabled (Grant)</option>
            </select>
          </div>
          <div className="zy-form-group">
            <label>Expires At (Optional)</label>
            <input 
              type="datetime-local" 
              value={newRule.expiresAt}
              onChange={e => setNewRule({...newRule, expiresAt: e.target.value})}
            />
          </div>
        </div>
        <div className="zy-form-group">
          <label>Violation Reason / Moderator Note</label>
          <input 
            type="text" 
            placeholder="e.g. Repeated harassment in video calls" 
            value={newRule.reason}
            onChange={e => setNewRule({...newRule, reason: e.target.value})}
            required
          />
        </div>
        <button type="submit" className="zy-admin-btn danger">Apply User Restriction</button>
      </form>

      <div className="zy-admin-table-container">
        <table className="zy-admin-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Feature</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Expiry</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id}>
                <td className="zy-user-id">#{r.user_id}</td>
                <td>{r.feature_key}</td>
                <td>
                  <span className={`zy-status-badge ${r.enabled ? 'active' : 'inactive'}`}>
                    {r.enabled ? 'Allowed' : 'Revoked'}
                  </span>
                </td>
                <td>{r.reason}</td>
                <td>{r.expires_at ? new Date(r.expires_at).toLocaleString() : 'Permanent'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserFeatureControlPanel;
