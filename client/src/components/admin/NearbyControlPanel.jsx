import React, { useState, useEffect } from 'react';

const NearbyControlPanel = () => {
  const [settings, setSettings] = useState({
    radiusKm: 5,
    approximateOnly: true,
    reportThreshold: 3,
    killSwitch: false // We'll map this to !nearby_enabled
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGlobalFlag();
    fetchNearbySettings();
  }, []);

  const fetchGlobalFlag = async () => {
    try {
      const response = await fetch('/api/admin/features', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await response.json();
      const nearby = data.find(f => f.feature_key === 'nearby_enabled');
      if (nearby) {
        setSettings(s => ({...s, killSwitch: !nearby.enabled}));
      }
    } catch (err) {
      console.error('Failed to fetch nearby flag:', err);
    }
  };

  const fetchNearbySettings = async () => {
    try {
      const response = await fetch('/api/admin/features/nearby-settings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await response.json();
      if (data) {
        setSettings(s => ({
          ...s,
          radiusKm: data.default_radius_km,
          reportThreshold: data.report_threshold,
          approximateOnly: !!data.approximate_only
        }));
      }
    } catch (err) {
      console.error('Failed to fetch nearby settings:', err);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/features/nearby-settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          default_radius_km: settings.radiusKm,
          report_threshold: settings.reportThreshold,
          approximate_only: settings.approximateOnly ? 1 : 0
        })
      });
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleKillSwitch = async () => {
    setLoading(true);
    try {
      const newKillState = !settings.killSwitch;
      await fetch('/api/admin/features/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          featureKey: 'nearby_enabled',
          enabled: !newKillState
        })
      });
      setSettings({...settings, killSwitch: newKillState});
    } catch (error) {
      console.error('Failed to toggle kill switch:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="zy-admin-card glass">
      <div className="zy-card-header">
        <h3>Nearby Discovery Control</h3>
        <p>Global safety and proximity parameters for the discovery feature</p>
      </div>

      <div className="zy-admin-controls-grid">
        <div className="zy-control-card danger">
          <h4>Emergency Kill Switch</h4>
          <p>Instantly disable all nearby discovery features platform-wide</p>
          <button 
            className={`zy-admin-btn ${settings.killSwitch ? 'success' : 'danger'}`}
            onClick={handleToggleKillSwitch}
            disabled={loading}
          >
            {loading ? 'PROCESSING...' : (settings.killSwitch ? 'ENABLE NEARBY' : 'DISABLE NEARBY NOW')}
          </button>
        </div>

        <div className="zy-control-card">
          <h4>Proximity Rules</h4>
          <div className="zy-form-group">
            <label>Default Search Radius</label>
            <select 
              value={settings.radiusKm}
              onChange={e => setSettings({...settings, radiusKm: parseInt(e.target.value)})}
            >
              <option value="1">1 km (Strict)</option>
              <option value="5">5 km (Standard)</option>
              <option value="10">10 km (Wide)</option>
              <option value="50">City-wide (Max)</option>
            </select>
          </div>
          <div className="zy-form-group checkbox">
            <input 
              type="checkbox" 
              id="approximate"
              checked={settings.approximateOnly}
              onChange={e => setSettings({...settings, approximateOnly: e.target.checked})}
            />
            <label htmlFor="approximate">Force Approximate Location (Safety First)</label>
          </div>
        </div>

        <div className="zy-control-card">
          <h4>Safety Thresholds</h4>
          <div className="zy-form-group">
            <label>Report Threshold (Auto-hide)</label>
            <input 
              type="number" 
              value={settings.reportThreshold}
              onChange={e => setSettings({...settings, reportThreshold: e.target.value})}
            />
            <small>Number of reports before user is auto-hidden from discovery</small>
          </div>
        </div>
      </div>

      <div className="zy-admin-actions">
        <button className="zy-admin-btn primary" onClick={handleSaveSettings} disabled={loading}>
          {loading ? 'SAVING...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};

export default NearbyControlPanel;
