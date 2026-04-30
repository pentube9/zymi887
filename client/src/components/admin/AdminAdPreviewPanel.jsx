import React from 'react';
import AdSlotPreview from './AdSlotPreview.jsx';
import AdPolicyStatus from './AdPolicyStatus.jsx';
import './AdControlCenter.css';

const AdminAdPreviewPanel = ({ config }) => {
  if (!config) return null;

  const activeNetwork = config.global.active_network;
  const isEnabled = config.global.ads_enabled;
  const testMode = config.global.test_mode;

  const isPlacementEnabled = (key) => {
    const placement = config.placements.find(p => p.placement_key === key);
    return placement && placement.enabled;
  };

  return (
    <div className="zy-admin-section glass">
      <h2>Preview & Policy Check</h2>
      
      {!isEnabled && (
        <div className="zy-policy-alert critical">
          MASTER KILL SWITCH IS ACTIVE. NO ADS WILL BE SHOWN.
        </div>
      )}

      {isEnabled && testMode && (
        <div className="zy-policy-alert notice">
          TEST MODE IS ON. Safe for development.
        </div>
      )}

      <AdPolicyStatus config={config} />

      {isEnabled && (
        <div className="zy-preview-grid">
          {isPlacementEnabled('app_open') && <AdSlotPreview type="interstitial" network={activeNetwork} title="App Open" />}
          {isPlacementEnabled('call_end_interstitial') && <AdSlotPreview type="interstitial" network={activeNetwork} title="Call End" />}
          {isPlacementEnabled('chat_list_native') && <AdSlotPreview type="native" network={activeNetwork} title="Chat Native" />}
          {isPlacementEnabled('rewarded_unlock') && <AdSlotPreview type="rewarded" network={activeNetwork} title="Rewarded" />}
          {isPlacementEnabled('settings_banner') && <AdSlotPreview type="banner" network={activeNetwork} title="Banner" />}
        </div>
      )}
    </div>
  );
};

export default AdminAdPreviewPanel;
