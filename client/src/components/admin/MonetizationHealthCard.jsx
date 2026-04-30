import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const MonetizationHealthCard = ({ authHeader, API_URL }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/ad-control/settings`, authHeader);
        if (!res.ok) throw new Error('Failed to fetch');
        const config = await res.json();
        
        // Process summary
        const activePlacements = config.placements.filter(p => p.enabled).length;
        const warnings = [];
        
        const activeNet = config.networks.find(n => n.network_key === config.global.active_network);
        if (!activeNet || !activeNet.is_active) warnings.push('Active network disabled');
        if (config.global.ads_enabled && !activeNet?.app_id) warnings.push('Missing App ID');
        if (config.global.interstitial_gap_seconds < 1800) warnings.push('Aggressive frequency');

        setData({
          enabled: config.global.ads_enabled,
          activeNetwork: config.global.active_network,
          testMode: config.global.test_mode,
          activePlacements,
          warningCount: warnings.length,
          lastUpdated: config.global.updated_at
        });
        setLoading(false);
      } catch (err) {
        console.error('Monetization card fetch error:', err);
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds (conservative polling)
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [authHeader, API_URL]);

  if (loading) return <div className="stat-card loading">Loading monetization...</div>;
  if (!data) return null;

  return (
    <div className={`stat-card monetization ${data.enabled ? 'active' : 'disabled'}`}>
      <div className="stat-icon">💰</div>
      <div className="stat-value">{data.enabled ? 'Ads Active' : 'Ads Killed'}</div>
      <div className="stat-label">
        {data.activeNetwork.toUpperCase()} • {data.activePlacements} Slots
      </div>
      <div className="stat-meta">
        {data.testMode ? <span className="badge test">TEST MODE</span> : <span className="badge live">LIVE</span>}
        {data.warningCount > 0 && <span className="badge warn">⚠️ {data.warningCount} Issues</span>}
      </div>
    </div>
  );
};

export default MonetizationHealthCard;
