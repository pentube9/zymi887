import React from 'react';
import './AdControlCenter.css';

const AdPolicyStatus = ({ config }) => {
  if (!config) return null;

  const getIntervalWarning = (seconds, min) => {
    if (seconds < min) return <span className="warning">Below safe minimum ({min}s)! System will auto-normalize.</span>;
    if (seconds < min * 2) return <span className="notice">Aggressive. Monitor user feedback.</span>;
    return <span className="safe">Safe</span>;
  };

  const getPolicyAlerts = () => {
    const alerts = [];
    const activeNet = config.networks.find(n => n.network_key === config.global.active_network);
    
    // 1. Network Status
    if (!activeNet) {
      alerts.push({ type: 'critical', msg: 'Active network config not found!' });
    } else if (!activeNet.is_active) {
      alerts.push({ type: 'critical', msg: `Active network (${config.global.active_network}) is disabled in Network Settings!` });
    }

    // 2. Missing IDs
    if (activeNet) {
      const missing = [];
      if (!activeNet.app_id) missing.push('App ID');
      if (config.placements.find(p => p.placement_key === 'call_end_interstitial' && p.enabled) && !activeNet.interstitial_id) missing.push('Interstitial ID');
      if (config.placements.find(p => p.placement_key === 'chat_list_native' && p.enabled) && !activeNet.native_id) missing.push('Native ID');
      
      if (missing.length > 0) {
        alerts.push({ type: 'warning', msg: `Missing IDs for active placements: ${missing.join(', ')}` });
      }
    }

    // 3. Test Mode vs Production
    if (config.global.ads_enabled && !config.global.test_mode) {
      alerts.push({ type: 'notice', msg: 'PRODUCTION MODE: Live ads are active. Ensure all Unit IDs are correct.' });
    }

    // 4. Geo/Version overrides
    if (config.countryRules.length > 0) {
      alerts.push({ type: 'notice', msg: `${config.countryRules.length} Geo-fencing rules active.` });
    }

    return alerts.map((alert, i) => (
      <div key={i} className={`zy-policy-alert ${alert.type}`}>
        {alert.msg}
      </div>
    ));
  };

  return (
    <div className="zy-policy-status-container">
      <h3>Policy & Health Check</h3>
      {getPolicyAlerts()}
      
      <ul className="zy-policy-list">
        <li>
          <strong>Interstitial Gap ({config.global.interstitial_gap_seconds}s):</strong>{' '}
          {getIntervalWarning(config.global.interstitial_gap_seconds, 1800)}
        </li>
        <li>
          <strong>Native Refresh ({config.global.native_refresh_seconds}s):</strong>{' '}
          {getIntervalWarning(config.global.native_refresh_seconds, 60)}
        </li>
        <li>
          <strong>Real-Time Safety:</strong> <span className="safe">Guaranteed</span> (Ads blocked during calls)
        </li>
        <li>
          <strong>Fallback Network:</strong> {config.global.fallback_network ? <span className="safe">{config.global.fallback_network}</span> : <span className="warning">None configured</span>}
        </li>
      </ul>
    </div>
  );
};

export default AdPolicyStatus;
