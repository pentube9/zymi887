import React, { useState, useEffect } from 'react';

const GeoControlPanel = () => {
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({
    featureKey: 'nearby_enabled',
    countryCode: '',
    cityName: '',
    enabled: false,
    reason: ''
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/admin/features/geo-rules', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await response.json();
      setRules(data);
    } catch (error) {
      console.error('Error fetching geo rules:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/features/geo-rules', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(newRule)
      });
      setNewRule({ ...newRule, countryCode: '', cityName: '', reason: '' });
      fetchRules();
    } catch (error) {
      console.error('Error creating geo rule:', error);
    }
  };

  return (
    <div className="zy-admin-card glass">
      <div className="zy-card-header">
        <h3>Geo-Fencing Control</h3>
        <p>Enable/Disable features by Country or City</p>
      </div>

      <form className="zy-admin-form" onSubmit={handleSubmit}>
        <div className="zy-form-grid">
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
            <label>Country Code (ISO 2)</label>
            <input 
              type="text" 
              placeholder="e.g. BD, US" 
              value={newRule.countryCode}
              onChange={e => setNewRule({...newRule, countryCode: e.target.value.toUpperCase()})}
            />
          </div>
          <div className="zy-form-group">
            <label>City Name (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Dhaka" 
              value={newRule.cityName}
              onChange={e => setNewRule({...newRule, cityName: e.target.value})}
            />
          </div>
          <div className="zy-form-group">
            <label>Status</label>
            <select 
              value={newRule.enabled} 
              onChange={e => setNewRule({...newRule, enabled: e.target.value === 'true'})}
            >
              <option value="false">Disabled</option>
              <option value="true">Enabled</option>
            </select>
          </div>
        </div>
        <div className="zy-form-group">
          <label>Reason / Compliance Note</label>
          <input 
            type="text" 
            placeholder="Why is this restricted?" 
            value={newRule.reason}
            onChange={e => setNewRule({...newRule, reason: e.target.value})}
          />
        </div>
        <button type="submit" className="zy-admin-btn success">Add Geo Rule</button>
      </form>

      <div className="zy-admin-table-container">
        <table className="zy-admin-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Region</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id}>
                <td>{r.feature_key}</td>
                <td>{r.country_code} {r.city_name ? `(${r.city_name})` : ''}</td>
                <td>
                  <span className={`zy-status-badge ${r.enabled ? 'active' : 'inactive'}`}>
                    {r.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td>{r.reason}</td>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GeoControlPanel;
